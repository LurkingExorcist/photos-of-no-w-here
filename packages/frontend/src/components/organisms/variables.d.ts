import 'react';

declare module 'react' {
    interface CSSProperties {
        '--position-x'?: string;
        '--position-y'?: string;
        '--scale'?: string;
        '--translate-transition-duration'?: string;
    }
}
