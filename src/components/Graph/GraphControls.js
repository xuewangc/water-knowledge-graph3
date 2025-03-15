import React from 'react';

const GraphControls = ({ onZoom, onPan, onReset }) => {
    return (
        <div className="graph-controls">
            <div className="control-group zoom-controls">
                <button
                    className="control-button zoom-in"
                    onClick={() => onZoom('in')}
                    title="放大"
                >
                    +
                </button>
                <button
                    className="control-button zoom-out"
                    onClick={() => onZoom('out')}
                    title="缩小"
                >
                    -
                </button>
            </div>

            <div className="control-group pan-controls">
                <button
                    className="control-button pan-up"
                    onClick={() => onPan('up')}
                    title="上移"
                >
                    ↑
                </button>
                <div className="pan-horizontal">
                    <button
                        className="control-button pan-left"
                        onClick={() => onPan('left')}
                        title="左移"
                    >
                        ←
                    </button>
                    <button
                        className="control-button pan-right"
                        onClick={() => onPan('right')}
                        title="右移"
                    >
                        →
                    </button>
                </div>
                <button
                    className="control-button pan-down"
                    onClick={() => onPan('down')}
                    title="下移"
                >
                    ↓
                </button>
            </div>

            <button
                className="control-button reset"
                onClick={onReset}
                title="重置视图"
            >
                重置
            </button>
        </div>
    );
};

export default GraphControls;
