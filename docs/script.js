const wordListItemIdPrefix = 'word-list-item';
const localStorageKey = 'wordItems';

const activeWordListElement = document.querySelector('.active-word-list');
const completedWordListElement = document.querySelector('.completed-word-list');
const wordField = document.querySelector('input[name="word"]');
const meaningField = document.querySelector('input[name="meaning"]');

const defaultWordItem = {
  id: undefined,
  word: undefined,
  meaning: undefined,
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

  const {word, meaning, isMarkedAsMemorized} = wordItem;

  const listElement = document.createElement('li');
  listElement.id = `${wordListItemIdPrefix}-${id}`;

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

const registerWord = (word, meaning) => {
  const id = crypto.randomUUID();

  const newItem = {
    ...defaultWordItem,
    id,
    word,
    meaning,
  };
  proxy.push(newItem);

  addActiveWord(id);
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

  registerWord(word, meaning);
  clearNewEntryForm();
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
