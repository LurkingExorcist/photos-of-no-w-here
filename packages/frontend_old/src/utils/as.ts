import { isNil } from 'lodash';

export const as = {
    px(value?: number | null) {
        if (isNil(value)) {
            return '0px';
        }

        return `${value}px`;
    },
    percent(value?: number | null) {
        if (isNil(value)) {
            return '0%';
        }

        return `${value}%`;
    },
};
