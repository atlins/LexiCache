const wordListItemIdPrefix = 'word-list-item';
const localStorageKey = 'wordItems';

const wordListItemClassName = 'word-list-item';

const activeWordListElement = document.querySelector('.active-word-list');
const completedWordListElement = document.querySelector('.completed-word-list');
const wordField = document.querySelector('input[name="word"]');
const meaningField = document.querySelector('input[name="meaning"]');
const usageExpressionField = document.querySelector('input[name="usage-expression"]');
const usageMeaningField = document.querySelector('input[name="usage-meaning"]');

const defaultWordItem = {
  id: undefined,
  word: undefined,
  meaning: undefined,
  usages: undefined,
  isMarkedAsMemorized: false,
};

const wordItems = [];

const handleWordItemsChange = {
  set(target, property, value, receiver) {
    localStorage.setItem(localStorageKey, JSON.stringify(wordItems));
    return Reflect.set(target, property, value, receiver);
  },
};

const proxy = new Proxy(wordItems, handleWordItemsChange);

const createWordItemElement = id => {
  const wordItem = wordItems.find(item => item.id === id);
  if (!wordItem) {
    return null;
  }

  const {word, meaning, usages, isMarkedAsMemorized} = wordItem;

  const listElement = document.createElement('li');
  listElement.id = `${wordListItemIdPrefix}-${id}`;
  listElement.className = wordListItemClassName;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = String(id);
  checkbox.checked = isMarkedAsMemorized;
  checkbox.addEventListener('change', handleClickWordItemCheckbox);

  const wordSpan = document.createElement('span');
  wordSpan.className = 'word';
  wordSpan.textContent = word;

  const meaningSpan = document.createElement('span');
  meaningSpan.className = 'meaning';
  meaningSpan.textContent = meaning;

  listElement.append(checkbox);
  listElement.append(wordSpan);
  listElement.append(meaningSpan);

  // TODO: loop for the usages array.
  if (usages !== undefined && usages.length > 0) {
    for (const usage of usages) {
      const usageExpressionSpan = document.createElement('span');
      usageExpressionSpan.className = 'usage-expression';
      usageExpressionSpan.textContent = usage.expression;

      const usageMeaningSpan = document.createElement('span');
      usageMeaningSpan.className = 'usage-meaning';
      usageMeaningSpan.textContent = usage.meaning;

      listElement.append(usageExpressionSpan);
      listElement.append(usageMeaningSpan);
    }
  }

  const removeButton = document.createElement('input');
  removeButton.type = 'button';
  removeButton.name = String(id);
  removeButton.value = 'Remove';
  removeButton.addEventListener('click', handleClickRemoveWordButton);

  listElement.append(removeButton);

  return listElement;
};

const addActiveWord = id => {
  updateWord(id, {isMarkedAsMemorized: false});
  activeWordListElement.prepend(createWordItemElement(id));
};

const updateWord = (
  id,
  /*
  * The option value can be even partial:
  *   {isMarkedAsMemorized: true}
  * or overall:
  *   {
  *     id: undefined,
  *     word: undefined,
  *     meaning: undefined,
  *     isMarkedAsMemorized: false,
  *   }
  */
  option,
) => {
  const index = wordItems.findIndex(item => item.id === id);
  const newWordItem = {
    ...wordItems.at(index),
    ...option,
  };
  proxy.splice(index, 1, newWordItem);
};

const removeActiveWord = id => {
  const wordItemElement = document.querySelector(`#${wordListItemIdPrefix}-${id}`);
  wordItemElement.remove();
};

const registerWord = (word, meaning, usages) => {
  const id = crypto.randomUUID();

  const newItem = {
    ...defaultWordItem,
    id,
    word,
    usages,
    meaning,
  };
  proxy.push(newItem);
  console.log({proxy});

  addActiveWord(id);
};

const unregisterWord = id => {
  const index = wordItems.findIndex(item => item.id === id);

  removeWord(id);
  proxy.splice(index, 1);
};

const addCompletedWord = id => {
  updateWord(id, {isMarkedAsMemorized: true});
  completedWordListElement.prepend(createWordItemElement(id));
};

const removeCompletedWord = id => {
  const wordItemElement = document.querySelector(`#${wordListItemIdPrefix}-${id}`);
  wordItemElement.remove();
};

const markAsMemorized = id => {
  removeActiveWord(id);
  addCompletedWord(id);
};

const unmarkAsMemorized = id => {
  removeCompletedWord(id);
  addActiveWord(id);
};

const removeWord = id => {
  const wordItem = wordItems.find(item => item.id === id);
  if (wordItem.isMarkedAsMemorized) {
    removeCompletedWord(id);
  } else {
    removeActiveWord(id);
  }
};

const clearNewEntryForm = () => {
  const form = document.querySelector('#new-entry-form');
  form.reset();
};

const handleClickWordItemCheckbox = event => {
  const targetId = event.target.name;
  const isChecked = event.target.checked;

  if (isChecked) {
    markAsMemorized(targetId);
  } else {
    unmarkAsMemorized(targetId);
  }
};

const handleClickAddActiveWordButton = () => {
  const word = wordField.value;
  const meaning = meaningField.value;
  const usages = [];
  const usage = {
    expression: usageExpressionField.value,
    meaning: usageMeaningField.value,
  };
  usages.push(usage);

  registerWord(word, meaning, usages);
  clearNewEntryForm();
};

const handleClickRemoveWordButton = event => {
  const targetId = event.target.name;
  unregisterWord(targetId);
};

const displayAllWords = () => {
  for (const item of wordItems) {
    const {id, isMarkedAsMemorized} = item;
    if (isMarkedAsMemorized) {
      addCompletedWord(id);
    } else {
      addActiveWord(id);
    }
  }
};

const fetchWords = () => {
  const data = localStorage.getItem(localStorageKey);
  if (data) {
    const dataObject = JSON.parse(data);
    for (const item of dataObject) {
      proxy.push(item);
    }
  }
};

fetchWords();
displayAllWords();

globalThis.handleClickAddActiveWordButton = handleClickAddActiveWordButton;
globalThis.handleClickWordItemCheckbox = handleClickWordItemCheckbox;
