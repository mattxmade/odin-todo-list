const updateStorage = (item, object) =>
  localStorage.setItem("projectList", JSON.stringify(projects));

const checkStorage = (userStorage) => {
  const storage = [];

  if (userStorage && userStorage.length) {
    JSON.parse(userStorage).forEach((item) => {
      storage.push(item);
    });
  }
  return storage;
};

export { updateStorage, checkStorage };
