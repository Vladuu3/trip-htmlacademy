/**
 * Creates an event handler for the Escape key
 * @param {Function} callback Function to call when Escape is pressed
 * @returns {Function} Event handler function
 */
const createEscapeKeyHandler = (callback) => (evt) => {
  if (evt.key === 'Escape') {
    evt.preventDefault();
    callback();
  }
};

export {createEscapeKeyHandler};
