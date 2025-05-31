const wordListItemIdPrefix = 'word-list-item';

const wordItems = [];
const defaultWordItem = {
  id: undefined,
  word: undefined,
  meaning: undefined,
  isMarkedAsMemorized: false,
};

const activeWordListElement = document.querySelector('.active-word-list');
const completedWordListElement = document.querySelector('.completed-word-list');
const wordField = document.querySelector('input[name="word"]');
const meaningField = document.querySelector('input[name="meaning"]');

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
  const wordItem = wordItems.find(item => item.id === id);
  wordItem.isMarkedAsMemorized = false;
  activeWordListElement.prepend(createWordItemElement(id));
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
  wordItems.push(newItem);

  addActiveWord(id);
};

const addCompletedWord = id => {
  const wordItem = wordItems.find(item => item.id === id);
  wordItem.isMarkedAsMemorized = true;
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

globalThis.handleClickAddActiveWordButton = handleClickAddActiveWordButton;
globalThis.handleClickWordItemCheckbox = handleClickWordItemCheckbox;
