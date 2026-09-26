export function scrollToSection(id: string) {
    document.getElementById(id.replace(/^#/, ''))?.scrollIntoView({ block: 'start' });
}
