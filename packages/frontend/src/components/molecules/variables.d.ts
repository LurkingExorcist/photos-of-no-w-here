import 'react';

declare module 'react' {
    interface CSSProperties {
        '--chunk-x'?: string;
        '--chunk-y'?: string;
        '--chunk-size'?: string;
        '--cell-size'?: string;
    }
}
