import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartProps {
  data: any[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export const TradingChart: React.FC<ChartProps> = ({
  data,
  colors: {
    backgroundColor = 'transparent',
    lineColor = '#3b82f6',
    textColor = '#9ca3af',
    areaTopColor = 'rgba(59, 130, 246, 0.4)',
    areaBottomColor = 'rgba(59, 130, 246, 0.0)',
  } = {},
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Ensure container has dimensions
    const width = chartContainerRef.current.clientWidth || 500;
    const height = 400; // Fixed height for robustness

    try {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor === 'transparent' ? '#0a0a0c' : backgroundColor },
          textColor,
          fontFamily: 'Outfit',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        width,
        height,
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: true,
        },
        rightPriceScale: {
          borderVisible: false,
        },
      });

      const series = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: areaTopColor,
        bottomColor: areaBottomColor,
        lineWidth: 2,
      });

      chartRef.current = chart;
      seriesRef.current = series;

      if (data && data.length > 0) {
        series.setData(data);
      }

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    } catch (err) {
      console.error("Failed to initialize lightweight-chart:", err);
    }
  }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  // Dynamic Update Effect
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      try {
        seriesRef.current.setData(data);
      } catch (err) {
        console.warn("Chart data update failed (likely time ordering):", err);
      }
    }
  }, [data]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ 
        width: '100%', 
        height: '400px', 
        position: 'relative',
        background: '#0a0a0c',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};
