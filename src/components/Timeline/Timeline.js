import React, { useState, useEffect, useRef } from 'react';

const Timeline = ({ startYear, endYear, onFilterChange }) => {
    const [range, setRange] = useState({ start: startYear, end: endYear });
    const [isDragging, setIsDragging] = useState(null);
    const timelineRef = useRef(null);


    // 时间轴的关键年份
    const keyYears = [
        { year: -1600, label: '公元前1600年' },
        { year: -1200, label: '公元前1200年' },
        { year: -800, label: '公元前800年' },
        { year: -400, label: '公元前400年' },
        { year: 0, label: '公元元年' },
        { year: 400, label: '公元400年' },
        { year: 800, label: '公元800年' },
        { year: 1200, label: '公元1200年' },
        { year: 1600, label: '公元1600年' },
        { year: 1911, label: '公元1911年' }
    ];
    // 预设的朝代范围
    const dynasties = [
        // 先秦时期
        { name: '春秋', start: -770, end: -476, color: '#B19CD9' },
        { name: '战国', start: -475, end: -221, color: '#9370DB' },
        { name: '秦朝', start: -221, end: -207, color: '#8A2BE2' },

        // 汉朝时期
        { name: '西汉', start: -202, end: 8, color: '#FF6347' },
        { name: '新朝', start: 9, end: 23, color: '#FF7F50' },
        { name: '东汉', start: 25, end: 220, color: '#FF4500' },

        // 三国两晋时期
        { name: '三国', start: 220, end: 280, color: '#32CD32' },
        { name: '西晋', start: 265, end: 316, color: '#3CB371' },
        { name: '东晋', start: 317, end: 420, color: '#2E8B57' },

        // 南北朝隋唐时期
        { name: '南北朝', start: 420, end: 589, color: '#1E90FF' },
        { name: '隋朝', start: 581, end: 618, color: '#4169E1' },
        { name: '唐朝', start: 618, end: 907, color: '#0000CD' },

        // 五代十国宋朝时期
        { name: '五代十国', start: 907, end: 960, color: '#FF8C00' },
        { name: '北宋', start: 960, end: 1127, color: '#FFA500' },
        { name: '南宋', start: 1127, end: 1279, color: '#FF7F00' },

        // 元明清时期
        { name: '元朝', start: 1271, end: 1368, color: '#FFD700' },
        { name: '明朝', start: 1368, end: 1644, color: '#CD5C5C' },
        { name: '清朝', start: 1644, end: 1911, color: '#9ACD32' }
    ];

    useEffect(() => {
        // 只有当范围有效时才触发过滤器变化
        if (range.start < range.end) {
            onFilterChange(range.start, range.end);
        } else {
            // 如果范围无效，修正范围
            setRange(prev => ({
                start: Math.min(prev.start, prev.end - 1),
                end: Math.max(prev.end, prev.start + 1)
            }));
        }
    }, [range, onFilterChange]);

    // 将年份转换为时间轴上的位置
    const yearToPosition = (year) => {
        const timelineWidth = 100;
        const yearRange = endYear - startYear;
        return ((year - startYear) / yearRange) * timelineWidth;
    };

    // 将位置转换为年份
    const positionToYear = (position, width) => {
        const yearRange = endYear - startYear;
        const year = Math.round(startYear + (position / width) * yearRange);
        return Math.max(startYear, Math.min(endYear, year));
    };

    // 处理拖动开始
    const handleDragStart = (handle) => (e) => {
        e.preventDefault();
        setIsDragging(handle);
    };

    // 处理拖动 - 修正后的逻辑
    const handleDrag = (e) => {
        if (!isDragging || !timelineRef.current) return;

        const timelineRect = timelineRef.current.getBoundingClientRect();
        const position = Math.max(0, Math.min(timelineRect.width, e.clientX - timelineRect.left));
        const year = positionToYear(position, timelineRect.width);

        setRange(prev => {
            if (isDragging === 'start') {
                // 确保开始滑块不会超过结束滑块
                return { ...prev, start: Math.min(year, prev.end - 1) };
            } else {
                // 确保结束滑块不会在开始滑块之前
                return { ...prev, end: Math.max(year, prev.start + 1) };
            }
        });
    };

    // 处理拖动结束
    const handleDragEnd = () => {
        setIsDragging(null);
    };

    // 处理点击朝代快速设置时间范围 - 修正后的逻辑
    const handleDynastyClick = (dynasty) => {
        // 确保开始总是在结束之前，即使朝代数据不正确
        const start = Math.min(dynasty.start, dynasty.end);
        const end = Math.max(dynasty.start, dynasty.end);
        setRange({ start, end });
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);

    return (
        <div className="timeline-container">
            <h3 className="timeline-title">时间轴</h3>

            <div className="dynasty-selector">
                {dynasties.map(dynasty => (
                    <button
                        key={dynasty.name}
                        className="dynasty-button"
                        style={{ backgroundColor: dynasty.color }}
                        onClick={() => handleDynastyClick(dynasty)}
                    >
                        {dynasty.name} ({dynasty.start}-{dynasty.end})
                    </button>
                ))}
            </div>

            <div
                className="timeline"
                ref={timelineRef}
            >
                {/* 时间轴背景 */}
                <div className="timeline-background">
                    {dynasties.map(dynasty => (
                        <div
                            key={dynasty.name}
                            className="dynasty-period"
                            style={{
                                left: `${yearToPosition(dynasty.start)}%`,
                                width: `${yearToPosition(dynasty.end) - yearToPosition(dynasty.start)}%`,
                                backgroundColor: dynasty.color,
                                opacity: 0.3
                            }}
                            title={`${dynasty.name} (${dynasty.start}-${dynasty.end})`}
                        />
                    ))}
                </div>

                {/* 时间轴刻度 */}
                <div className="timeline-ticks">
                    {keyYears.map(({ year, label }) => (
                        <div
                            key={year}
                            className="timeline-tick"
                            style={{ left: `${yearToPosition(year)}%` }}
                        >
                            <div className="tick-mark" />
                            <div className="tick-label">{label}</div>
                        </div>
                    ))}
                </div>

                {/* 选择范围 */}
                <div
                    className="selected-range"
                    style={{
                        left: `${yearToPosition(range.start)}%`,
                        width: `${yearToPosition(range.end) - yearToPosition(range.start)}%`
                    }}
                />

                {/* 起始滑块 */}
                <div
                    className={`range-handle start-handle ${isDragging === 'start' ? 'dragging' : ''}`}
                    style={{ left: `${yearToPosition(range.start)}%` }}
                    onMouseDown={handleDragStart('start')}
                >
                    <div className="handle-label">{range.start}</div>
                </div>

                {/* 结束滑块 */}
                <div
                    className={`range-handle end-handle ${isDragging === 'end' ? 'dragging' : ''}`}
                    style={{ left: `${yearToPosition(range.end)}%` }}
                    onMouseDown={handleDragStart('end')}
                >
                    <div className="handle-label">{range.end}</div>
                </div>
            </div>

            <div className="time-range-display">
                当前选择: <span className="year-range">{range.start}年 - {range.end}年</span>
            </div>
        </div>
    );
};

export default Timeline;
