const subjectColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF',
  '#A0C4FF', '#BDB2FF', '#FFC6FF', '#E0BBE4', '#D291BC'
];

export const getSubjectColor = (subject: string): string => {
  if (!subject) return '#E0E0E0';
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash += subject.charCodeAt(i);
  }
  const index = hash % subjectColors.length;
  return subjectColors[index];
};