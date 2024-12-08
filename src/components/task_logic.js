export { elementSort };

function elementSort(elements, type) {
  const sortBy = type.split('_')[1];
  return elements.sort((a, b) => {
    switch (sortBy) {
      case 'hours':
        return b.info[type] - a.info[type];
      case 'priority':
        return a.info[type] - b.info[type];
      default:
        return (
          new Date(a.info[type]).getTime() - new Date(b.info[type]).getTime()
        );
    }
  });
}
