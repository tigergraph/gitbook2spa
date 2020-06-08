import * as React from 'react'

export const createMathComponent = (Component: any, { displayMode }: any): React.ComponentClass<any> => {
    return class extends React.Component<any> {
        usedProp = this.props.math ? 'math' : 'children'
        state = this.createNewState(null, this.props)

        componentWillReceiveProps() {
            this.setState(this.createNewState);
        }

        shouldComponentUpdate(nextProps: any) {
            return nextProps[this.usedProp] !== this.props[this.usedProp];
        }

        createNewState(prevState: any, props: any) {
            try {
                const html = this.generateHtml(props);

                return { html, error: undefined };
            } catch (error) {
                if (error instanceof KaTeX.ParseError || error instanceof TypeError) {
                    return { error };
                }

                throw error;
            }
        }

        generateHtml(props: any) {
            const { errorColor, renderError } = props;

            return KaTeX.renderToString(props[this.usedProp], {
                displayMode,
                errorColor,
                throwOnError: !!renderError
            });
        }

        render() {
            const { error, html } = this.state;
            const { renderError } = this.props;

            if (error) {
                return renderError ? (
                    renderError(error)
                ) : (
                        <Component html={`${error.message}`} /> as any
                    );
            }

            return <Component html={html} />;
        }
    }
}