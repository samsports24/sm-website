const initialState = {
  theme: localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark',
}

const ThemeReducer = (state = initialState, action) => {
  const { type } = action
  switch (type) {
    case 'TOGGLE_THEME': {
      const themeLocal = localStorage.getItem('theme')
      if (themeLocal === 'light') {
        localStorage.setItem('theme', 'dark')
      } else {
        localStorage.setItem('theme', 'light')
      }
      return {
        ...state,
        toggleTheme: !state.toggleTheme,
        theme: themeLocal === 'light' ? 'dark' : 'light',
      }
    }
    default:
      return state
  }
}

export default ThemeReducer
