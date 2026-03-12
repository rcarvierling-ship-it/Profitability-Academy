import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';

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
  const seriesRef = useRef<any>(null);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
        fontFamily: 'Outfit',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    const series = (chart as any).addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  // Update Data
  useEffect(() => {
    if (seriesRef.current && data) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: '100%', position: 'relative' }} />;
};
