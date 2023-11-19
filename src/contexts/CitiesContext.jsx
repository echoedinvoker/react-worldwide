import { createContext, useContext, useEffect, useReducer, useCallback } from "react";

const CitiesContext = createContext()

const BASE_URL = 'http://localhost:9000'

const initialState = {
  cities: [],
  currentCity: {},
  isLoading: false,
  error: ''
}

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: '' }
    case 'cities/loaded':
      return { ...state, cities: action.payload, isLoading: false }
    case 'city/loaded':
      return { ...state, currentCity: action.payload, isLoading: false }
    case 'city/created':
      return { ...state, currentCity: action.payload, cities: [...state.cities, action.payload], isLoading: false }
    case 'city/deleted':
      return { ...state, cities: state.cities.filter(city => city.id !== action.payload), isLoading: false }
    case 'rejected':
      return { ...state, isLoading: false, error: action.payload }
    default:
      throw new Error('Unknown action type')
  }
}

function CitiesProvider({ children }) {
  const [{ cities, currentCity, isLoading, error }, dispatch] = useReducer(reducer, initialState)

  useEffect(function() {
    async function fetchCities() {
      try {
        dispatch({ type: 'loading' })
        const res = await fetch('http://localhost:9000/cities')
        const data = await res.json()
        dispatch({ type: 'cities/loaded', payload: data })
      } catch {
        dispatch({ type: 'rejected', payload: 'There was an error loading data' })
      }
    }
    fetchCities()
  }, [])
  const fetchCity = useCallback(async function fetchCity(id) {
    if (currentCity.id === Number(id)) return
    try {
      dispatch({ type: 'loading' })
      const res = await fetch(`${BASE_URL}/cities/${id}`)
      const data = await res.json()
      dispatch({ type: 'city/loaded', payload: data })
    } catch (error) {
      dispatch({ type: 'rejected', payload: 'There was an error loading data' })
    }
  }, [currentCity.id])
  async function createCity(newCity) {
    try {
      dispatch({ type: 'loading' })
      const res = await fetch(`${BASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const data = await res.json()
      dispatch({ type: 'city/created', payload: data })
    } catch (error) {
      dispatch({ type: 'rejected', payload: 'There was an error creating city' })
    }
  }
  async function deleteCity(id) {
    try {
      dispatch({ type: 'loading' })
      await fetch(`${BASE_URL}/cities/${id}`, { method: 'DELETE' })
      dispatch({ type: 'city/deleted', payload: id })
    } catch (error) {
      dispatch({ type: 'rejected', payload: 'There was an error deleting city' })
    }
  }
  return (
    <CitiesContext.Provider value={{
      cities,
      isLoading,
      currentCity,
      error,
      fetchCity,
      createCity,
      deleteCity,
    }}>
      {children}
    </CitiesContext.Provider>
  )
}

function useCities() {
  const context = useContext(CitiesContext)
  if (context === undefined)
    throw new Error('CitiesContext was used outside the CitiesProvider')
  return context
}
export { useCities, CitiesProvider }
