export type Answers = Record<string, string>;

const wouldRatherBack = (answers: Answers) =>
    answers.running === 'no' || answers.give === 'money' || answers.time === 'minutes';

const bringsOthers = (answers: Answers) =>
    answers.company === 'crew' || answers.company === 'family' || answers.proof === 'total';

export function recommendModel(answers: Answers): string {
    if (wouldRatherBack(answers)) {
        return 'Guardian';
    }

    if (bringsOthers(answers)) {
        return 'Coalition';
    }

    return 'Solo';
}
