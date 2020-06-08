import * as React from 'react'
import { BlockData } from '.'

export type ApiMethodType = "api-method" | "api-method-summary" | "api-method-description" | "api-method-spec" | "api-method-request" | "api-method-path-parameters" | "api-method-parameter" | "api-method-response" | "api-method-response-example" | "api-method-response-example-description"

export const RenderApiMethod: React.FC<{
    type: ApiMethodType;
    children: any;
    data?: BlockData
}> = ({ type, children }) => {
    switch (type) {
        default:
            // return <div>{children}</div>
            return null
    }
}
