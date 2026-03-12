import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';

interface ChartProps {
  data: any[];
  slPrice?: number | null;
  tpPrice?: number | null;
  entryPrice?: number | null;
  height?: string | number;
  onLevelChange?: (type: 'SL' | 'TP', newPrice: number) => void;
  colors?: {
    backgroundColor?: string;
    textColor?: string;
    upColor?: string;
    downColor?: string;
  };
}

export const TradingChart: React.FC<ChartProps> = ({
  data,
  slPrice,
  tpPrice,
  entryPrice,
  height = 480,
  onLevelChange,
  colors: {
    backgroundColor = '#0a0a0c',
    textColor = '#9ca3af',
    upColor = '#10b981',
    downColor = '#ef4444',
  } = {},
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const slLineRef = useRef<IPriceLine | null>(null);
  const tpLineRef = useRef<IPriceLine | null>(null);
  const entryLineRef = useRef<IPriceLine | null>(null);

  const isDraggingRef = useRef<'SL' | 'TP' | null>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const getDimensions = () => {
      const width = container.clientWidth || window.innerWidth;
      const h = height === '100vh' ? window.innerHeight : (typeof height === 'number' ? height : container.clientHeight || 480);
      return { width, height: h };
    };

    const dims = getDimensions();

    try {
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor,
          fontFamily: 'Outfit',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
        },
        width: dims.width,
        height: dims.height,
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: true,
        },
        rightPriceScale: {
          borderVisible: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        crosshair: {
          mode: 1,
          vertLine: { color: 'rgba(255, 255, 255, 0.2)', labelBackgroundColor: '#1e293b' },
          horzLine: { color: 'rgba(255, 255, 255, 0.2)', labelBackgroundColor: '#1e293b' },
        },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor,
        downColor,
        borderVisible: false,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });

      chartRef.current = chart;
      seriesRef.current = series;

      if (data && data.length > 0) {
        series.setData(data);
        chart.timeScale().fitContent();
      }

      // Interaction Logic
      const handleMouseDown = (e: MouseEvent) => {
        if (!onLevelChange || !seriesRef.current || !chartRef.current) return;
        const rect = container.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const slY = slPrice ? seriesRef.current.priceToCoordinate(slPrice) : null;
        const tpY = tpPrice ? seriesRef.current.priceToCoordinate(tpPrice) : null;
        const tolerance = 20; 
        
        if (slY !== null && Math.abs(mouseY - slY) < tolerance) {
          isDraggingRef.current = 'SL';
          container.style.cursor = 'ns-resize';
        } else if (tpY !== null && Math.abs(mouseY - tpY) < tolerance) {
          isDraggingRef.current = 'TP';
          container.style.cursor = 'ns-resize';
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !seriesRef.current || !onLevelChange) return;
        const rect = container.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const newPrice = seriesRef.current.coordinateToPrice(y);
        if (newPrice) onLevelChange(isDraggingRef.current, newPrice);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = null;
        container.style.cursor = 'crosshair';
      };

      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      const handleResize = () => {
        if (container && chartRef.current) {
          const newDims = getDimensions();
          chartRef.current.applyOptions({ width: newDims.width, height: newDims.height });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    } catch (err) {
      console.error("Chart initialization error:", err);
    }
  }, [backgroundColor, textColor, upColor, downColor, height]);

  // Update Data
  useEffect(() => {
    if (seriesRef.current && data) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  // Update Price Lines
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    if (entryPrice) {
      if (!entryLineRef.current) {
        entryLineRef.current = series.createPriceLine({
          price: entryPrice, color: '#ffffff', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'ENTRY'
        });
      } else {
        entryLineRef.current.applyOptions({ price: entryPrice });
      }
    } else if (entryLineRef.current) {
      series.removePriceLine(entryLineRef.current);
      entryLineRef.current = null;
    }

    if (slPrice) {
      if (!slLineRef.current) {
        slLineRef.current = series.createPriceLine({
          price: slPrice, color: '#ef4444', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'SL (DRAG)'
        });
      } else {
        slLineRef.current.applyOptions({ price: slPrice });
      }
    } else if (slLineRef.current) {
      series.removePriceLine(slLineRef.current);
      slLineRef.current = null;
    }

    if (tpPrice) {
      if (!tpLineRef.current) {
        tpLineRef.current = series.createPriceLine({
          price: tpPrice, color: '#10b981', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'TP (DRAG)'
        });
      } else {
        tpLineRef.current.applyOptions({ price: tpPrice });
      }
    } else if (tpLineRef.current) {
      series.removePriceLine(tpLineRef.current);
      tpLineRef.current = null;
    }
  }, [entryPrice, slPrice, tpPrice]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ 
        width: '100%', 
        height: height === '100%' || height === '100vh' ? height : `${height}px`, 
        position: 'relative',
        background: backgroundColor,
        borderRadius: height === '100vh' ? '0' : '12px',
        overflow: 'hidden',
        cursor: 'crosshair',
        border: height === '100vh' ? 'none' : '1px solid var(--border-subtle)',
        transition: 'border-radius 0.3s ease'
      }} 
    />
  );
};
