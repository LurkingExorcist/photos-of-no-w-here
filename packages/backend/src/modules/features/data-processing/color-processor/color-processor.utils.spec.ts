import {
    calculateHueDifference,
    calculateWorkerSpectrum,
    findClosestMedia,
    isEqualWithPrecision,
    rgbToHex,
    rgbToHsl,
} from './color-processor.utils';

import type { Media } from '@/modules/features/data-processing/data-processing.types';

describe('Color Processor Utils', () => {
    let dummyPosts: Media[];

    beforeEach(async () => {
        dummyPosts = await import('../../../../__mock__/data/dummyPosts')
            .then((module) => module.getDummyPosts())
            .then((posts) => posts.map((post) => post.media[0]));
    });

    describe('isEqualWithPrecision', () => {
        it('should return true when numbers are equal', () => {
            expect(isEqualWithPrecision(1.0, 1.0)).toBe(true);
        });

        it('should return true when numbers are within default precision', () => {
            expect(isEqualWithPrecision(1.0, 1.009)).toBe(true);
        });

        it('should return false when numbers are outside default precision', () => {
            expect(isEqualWithPrecision(1.0, 1.02)).toBe(false);
        });

        it('should respect custom precision', () => {
            expect(isEqualWithPrecision(1.0, 1.02, 0.03)).toBe(true);
            expect(isEqualWithPrecision(1.0, 1.03, 0.02)).toBe(false);
        });
    });

    describe('calculateHueDifference', () => {
        it('should return 0 for identical hues', () => {
            expect(calculateHueDifference(0.5, 0.5)).toBeCloseTo(0);
        });

        it('should calculate minimum difference across circular boundary', () => {
            expect(calculateHueDifference(0.9, 0.1)).toBeCloseTo(0.2);
        });

        it('should handle standard differences', () => {
            expect(calculateHueDifference(0.2, 0.4)).toBeCloseTo(0.2);
        });
    });

    describe('rgbToHex', () => {
        it('should convert RGB values to hex string', () => {
            expect(rgbToHex(255, 0, 0)).toBe('ff0000');
            expect(rgbToHex(0, 255, 0)).toBe('00ff00');
            expect(rgbToHex(0, 0, 255)).toBe('0000ff');
        });

        it('should pad single digits with zeros', () => {
            expect(rgbToHex(0, 0, 0)).toBe('000000');
            expect(rgbToHex(1, 1, 1)).toBe('010101');
        });

        it('should handle mixed values', () => {
            expect(rgbToHex(128, 64, 32)).toBe('804020');
        });
    });

    describe('calculateWorkerSpectrum', () => {
        it('should divide spectrum evenly among workers', () => {
            expect(calculateWorkerSpectrum(4, 0)).toEqual([0, 64]);
            expect(calculateWorkerSpectrum(4, 1)).toEqual([64, 128]);
            expect(calculateWorkerSpectrum(4, 2)).toEqual([128, 192]);
            expect(calculateWorkerSpectrum(4, 3)).toEqual([192, 256]);
        });

        it('should handle single worker case', () => {
            expect(calculateWorkerSpectrum(1, 0)).toEqual([0, 256]);
        });

        it('should handle uneven division', () => {
            expect(calculateWorkerSpectrum(3, 0)).toEqual([0, 85]);
            expect(calculateWorkerSpectrum(3, 1)).toEqual([85, 170]);
            expect(calculateWorkerSpectrum(3, 2)).toEqual([170, 256]);
        });
    });

    describe('findClosestMedia', () => {
        const mockLogMessage = jest.fn();

        beforeEach(() => {
            mockLogMessage.mockClear();
        });

        it('should return null when no media is provided', () => {
            expect(
                findClosestMedia([], [0.5, 0.5, 0.5], 0, mockLogMessage)
            ).toBeNull();
        });

        it('should return null when media has no color data', () => {
            const mediaWithoutColor = { uri: 'test-uri' } as Media;
            expect(
                findClosestMedia(
                    [mediaWithoutColor],
                    [0.5, 0.5, 0.5],
                    0,
                    mockLogMessage
                )
            ).toBeNull();
            expect(mockLogMessage).toHaveBeenCalledWith(
                'Worker #0: no color found for test-uri'
            );
        });

        it('should find the closest media based on hue difference', () => {
            const result = findClosestMedia(
                dummyPosts,
                [0.5, 0.5, 0.5],
                0,
                mockLogMessage
            );
            expect(result).toBe(
                dummyPosts.find((post) =>
                    post.uri.includes(
                        '403902171_1424918184731338_5373193964231677187_n_17982274478545270.webp'
                    )
                )
            );
        });

        it('should consider lightness when hues are equal', () => {
            const media1: Media = {
                uri: 'test-uri-1',
                average_color_hsl: [0.5, 0.5, 0.5],
            } as Media;

            const media2: Media = {
                uri: 'test-uri-2',
                average_color_hsl: [0.5, 0.5, 0.4],
            } as Media;

            const result = findClosestMedia(
                [media1, media2],
                [0.5, 0.5, 0.4],
                0,
                mockLogMessage
            );
            expect(result).toBe(media2);
        });

        it('should consider saturation when hue and lightness are equal', () => {
            const media1: Media = {
                uri: 'test-uri-1',
                average_color_hsl: [0.5, 0.5, 0.5],
            } as Media;

            const media2: Media = {
                uri: 'test-uri-2',
                average_color_hsl: [0.5, 0.5, 0.5],
            } as Media;

            const media3: Media = {
                uri: 'test-uri-3',
                average_color_hsl: [0.5, 0.4, 0.5],
            } as Media;

            const result = findClosestMedia(
                [media1, media2, media3],
                [0.5, 0.4, 0.5],
                0,
                mockLogMessage
            );
            expect(result).toBe(media3);
        });
    });

    describe('rgbToHsl', () => {
        it('should convert pure red to HSL', () => {
            const result = rgbToHsl(255, 0, 0, 255);
            expect(result[0]).toBeCloseTo(0); // hue
            expect(result[1]).toBeCloseTo(1); // saturation
            expect(result[2]).toBeCloseTo(0.5); // lightness
        });

        it('should convert pure green to HSL', () => {
            const result = rgbToHsl(0, 255, 0, 255);
            expect(result[0]).toBeCloseTo(1 / 3); // hue
            expect(result[1]).toBeCloseTo(1); // saturation
            expect(result[2]).toBeCloseTo(0.5); // lightness
        });

        it('should convert pure blue to HSL', () => {
            const result = rgbToHsl(0, 0, 255, 255);
            expect(result[0]).toBeCloseTo(2 / 3); // hue
            expect(result[1]).toBeCloseTo(1); // saturation
            expect(result[2]).toBeCloseTo(0.5); // lightness
        });

        it('should convert white to HSL', () => {
            const result = rgbToHsl(255, 255, 255, 255);
            expect(result[0]).toBeCloseTo(0); // hue
            expect(result[1]).toBeCloseTo(0); // saturation
            expect(result[2]).toBeCloseTo(1); // lightness
        });

        it('should convert black to HSL', () => {
            const result = rgbToHsl(0, 0, 0, 255);
            expect(result[0]).toBeCloseTo(0); // hue
            expect(result[1]).toBeCloseTo(0); // saturation
            expect(result[2]).toBeCloseTo(0); // lightness
        });

        it('should convert gray to HSL', () => {
            const result = rgbToHsl(128, 128, 128, 255);
            expect(result[0]).toBeCloseTo(0); // hue
            expect(result[1]).toBeCloseTo(0); // saturation
            expect(result[2]).toBeCloseTo(0.5); // lightness
        });
    });
});
