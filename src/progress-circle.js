import React, { PureComponent } from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import * as shape from 'd3-shape'
import Path from './animated-path'
import Svg, { G } from 'react-native-svg'

class ProgressCircle extends PureComponent {
    state = {
        height: 0,
        width: 0,
    }

    toRoundedEven = (val) => {
      val = Math.round(val);
      val = Boolean(val % 2) ? val + 1 : val;
      return val;
    };

    _onLayout(event) {
        let {
            nativeEvent: {
                layout: { height, width },
            },
        } = event

        height = Math.floor(height);
        width = Math.floor(width);

        height = this.toRoundedEven(height);
        
        width = this.toRoundedEven(height);

        this.setState({ height, width })
    }

    render() {
        const {
            style,
            progressColor,
            backgroundColor,
            strokeWidth,
            startAngle,
            endAngle,
            animate,
            animateDuration,
            children,
            cornerRadius,
        } = this.props

        let { progress } = this.props

        const { height, width } = this.state

        let outerDiameter = this.toRoundedEven(Math.min(width, height));

        const radius = outerDiameter / 2;

        if (!isFinite(progress) || isNaN(progress)) {
            progress = 0
        }

        // important order to have progress render over "rest"
        const data = [
            {
                key: 'rest',
                value: 1 - progress,
                color: backgroundColor,
            },
            {
                key: 'progress',
                value: progress,
                color: progressColor,
            },
        ]

        const pieSlices = shape
            .pie()
            .value((d) => d.value)
            .sort((a) => (a.key === 'rest' ? 1 : -1))
            .startAngle(startAngle)
            .endAngle(endAngle)(data)

        const arcs = pieSlices.map((slice, index) => ({
            ...data[index],
            ...slice,
            path: shape
                .arc()
                .outerRadius(radius) // Radius of the pie
                .innerRadius(radius - strokeWidth) // Inner radius: to create a donut or pie
                .startAngle(index === 0 ? startAngle : slice.startAngle)
                .endAngle(index === 0 ? endAngle : slice.endAngle)
                .cornerRadius(cornerRadius)(),
        }))

        const extraProps = {
            width,
            height,
        }

        return (
            <View style={style} onLayout={(event) => this._onLayout(event)}>
                {height > 0 && width > 0 && (
                    <Svg style={{ width, height }}>
                        {/* center the progress circle*/}
                        <G x={radius} y={radius}>
                            {React.Children.map(children, (child) => {
                                if (child && child.props.belowChart) {
                                    return React.cloneElement(child, extraProps)
                                }
                                return null
                            })}
                            {arcs.map((shape, index) => {
                                return (
                                    <Path
                                        key={index}
                                        fill={shape.color}
                                        d={shape.path}
                                        animate={animate}
                                        animationDuration={animateDuration}
                                    />
                                )
                            })}
                            {React.Children.map(children, (child) => {
                                if (child && !child.props.belowChart) {
                                    return React.cloneElement(child, extraProps)
                                }
                                return null
                            })}
                        </G>
                    </Svg>
                )}
            </View>
        )
    }
}

ProgressCircle.propTypes = {
    progress: PropTypes.number.isRequired,
    style: PropTypes.any,
    progressColor: PropTypes.any,
    backgroundColor: PropTypes.any,
    strokeWidth: PropTypes.number,
    startAngle: PropTypes.number,
    endAngle: PropTypes.number,
    animate: PropTypes.bool,
    cornerRadius: PropTypes.number,
    animateDuration: PropTypes.number,
}

ProgressCircle.defaultProps = {
    progressColor: 'black',
    backgroundColor: '#ECECEC',
    strokeWidth: 5,
    startAngle: 0,
    endAngle: Math.PI * 2,
    cornerRadius: 45,
}

export default ProgressCircle
