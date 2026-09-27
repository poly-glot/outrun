import type { Answers } from '../index.ts';

const prefersBacking = (answers: Answers) =>
    answers.saturday === 'cheer' || answers.saturday === 'busy' || answers.give === 'wallet';

const bringsOthers = (answers: Answers) => answers.crew === 'us';

export function recommendModel(answers: Answers): string {
    if (prefersBacking(answers)) {
        return 'Patron';
    }

    if (bringsOthers(answers)) {
        return 'Pack';
    }

    return 'Stride';
}
