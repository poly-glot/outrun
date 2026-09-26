export const circlePath =
    'M84.7,11.9c-15.2,0-30.2,4.8-42.6,13.6c-12,8.6-21.3,20.7-26.4,34.6c-5.3,14.5-5.9,30.6-1.6,45.4c4.1,14.2,12.5,27.1,24,36.5c11.6,9.6,26,15.4,41,16.6c15.2,1.2,30.6-2.5,43.6-10.4c12.7-7.7,22.9-19.2,29-32.6c6.3-14,8.1-29.9,5-44.9c-3-14.6-10.5-28.2-21.3-38.5C124.6,21.9,110.8,15,96,12.8C92.3,12.2,88.5,11.9,84.7,11.9z';

export function archPath(percentage: number) {
    const angle = (Math.min(percentage, 99.9999) / 100) * 360;
    const radians = (angle * Math.PI) / 180;
    const x = Math.sin(radians) * 61;
    const y = Math.cos(radians) * -61;
    const large = angle > 180 ? 1 : 0;

    return `M 0 0 v -61 A 61 61 1 ${large} 1 ${x} ${y} z`;
}
