import * as React from 'react'

interface Props {
    layoutStyle?: React.CSSProperties
    onMouseLeave?: ()=>void
    children: (isEnter: boolean) => JSX.Element
    onPress?: () => void
}

export const OnHover: React.FC<Props> = ({ onMouseLeave, children, layoutStyle = {}, onPress }) => {
    const [isEnter, setIsEnter] = React.useState(false)
    return (
        <div
            onClick={() => onPress?.()}
            style={layoutStyle}
            onMouseEnter={() => setIsEnter(true)}
            onMouseLeave={() => {
                onMouseLeave?.()
                setIsEnter(false)
            }}
        >
            {children(isEnter)}
        </div>
    )
}
