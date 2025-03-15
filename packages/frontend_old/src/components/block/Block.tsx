import {
    MouseEventHandler,
    ReactEventHandler,
    memo,
    useCallback,
    useState,
} from 'react';
import { PropsWithClassName } from '@/types';
import { HSLToRGB, as } from '@/utils';

import './block.scss';
import clsx from 'clsx';
import { isNil } from 'lodash';
import fastHashCode from 'fast-hash-code';

type Props = {
    blockSize: number;
    hue: number;
    saturation: number;
    lightness: number;
    isActive?: boolean;
    onHover?: MouseEventHandler<HTMLDivElement>;
    onImageChange?: (hash: number) => void;
} & PropsWithClassName;

function RawBlock({
    className,
    hue,
    saturation,
    lightness,
    blockSize,
    isActive,
    onHover,
    onImageChange,
}: Props) {
    const [imageHash, setImageHash] = useState<number | null>(null);
    const onImageLoad: ReactEventHandler<HTMLImageElement> = useCallback(
        ({ currentTarget }) => {
            const c = document.createElement('canvas');
            const ctx = c.getContext('2d');
            c.width = currentTarget.naturalWidth; // update canvas size to match image
            c.height = currentTarget.naturalHeight;
            ctx?.drawImage(currentTarget, 0, 0); // draw in image
            c.toBlob(
                async (blob) => {
                    const newImageHash = blob
                        ? await blob.text().then(fastHashCode)
                        : null;

                    if (!isNil(newImageHash) && newImageHash !== imageHash) {
                        setImageHash(newImageHash);
                        onImageChange?.(newImageHash);
                    }
                },
                'image/jpeg',
                0.75
            );
        },
        [imageHash, onImageChange]
    );

    return (
        <img
            className={clsx(
                'block',
                {
                    'block--active': isActive,
                },
                className
            )}
            style={{
                '--block-hue': hue,
                '--block-saturation': !isNil(saturation)
                    ? as.percent(saturation)
                    : undefined,
                '--block-lightness': !isNil(lightness)
                    ? as.percent(lightness)
                    : undefined,
                width: as.px(blockSize),
                height: as.px(blockSize),
            }}
            src={`http://localhost:1111/api/image/${HSLToRGB({
                hue,
                saturation,
                lightness,
            })}`}
            crossOrigin="anonymous"
            onMouseOver={onHover}
            onLoad={onImageLoad}></img>
    );
}

export const Block = memo(RawBlock);
