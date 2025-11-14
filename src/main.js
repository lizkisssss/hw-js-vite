import debounce from 'lodash.debounce';
import { error, defaultModules } from '@pnotify/core';
import * as PNotifyMobile from '@pnotify/mobile'; 

defaultModules.set(PNotifyMobile, {});

const refs = {
  searchBox: document.querySelector('#search-box'),
  countryList: document.querySelector('#country-list'),
  countryInfo: document.querySelector('#country-info'),
};

const BASE_URL = 'https://restcountries.com/v2';
const DEBOUNCE_DELAY = 500;

function clearResults() {
  refs.countryList.innerHTML = '';
  refs.countryInfo.innerHTML = '';
}

function fetchCountries(searchQuery) {
  const fields = 'name,capital,population,flags,languages';
  const url = `${BASE_URL}/name/${searchQuery}?fields=${fields}`;

  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}

function renderCountryList(countries) {
  const markup = countries
    .map(country => `<li style="list-style: none; font-size: 18px; margin: 5px 0;">${country.name}</li>`)
    .join('');
  refs.countryList.innerHTML = markup;
  refs.countryInfo.innerHTML = '';
}

function renderCountryInfo(country) {
  const languages = country.languages.map(lang => `<li>${lang.name}</li>`).join('');

  const markup = `
    <div>
        <h2>${country.name}</h2>
        <p><b>Capital:</b> ${country.capital}</p>
        <p><b>Population:</b> ${country.population.toLocaleString()}</p>
        <p><b>Languages:</b></p>
        <ul>${languages}</ul>
    </div>
    <img src="${country.flags.svg}" alt="Flag of ${country.name}" width="200" style="margin-top: 15px;">
  `;
  refs.countryInfo.innerHTML = markup;
  refs.countryList.innerHTML = '';
}

function handleResponse(countries) {
  clearResults();
  
  if (countries.length > 10) {
    error({
      text: 'Too many matches found. Please enter a more specific query!',
      delay: 2500,
    });
  } else if (countries.length >= 2 && countries.length <= 10) {
    renderCountryList(countries);
  } else if (countries.length === 1) {
    renderCountryInfo(countries[0]);
  }
}

function handleSearch(event) {
  const searchQuery = event.target.value.trim();

  if (searchQuery === '') {
    clearResults();
    return;
  }

  fetchCountries(searchQuery)
    .then(handleResponse)
    .catch(err => {
      clearResults();
      if (err.message === '404') {
         error({
            text: 'No country found with that name.',
            delay: 2500,
          });
      } else {
        error({
          text: `An error occurred: ${err.message}`,
          delay: 2500,
        });
      }
    });
}

refs.searchBox.addEventListener(
  'input',
  debounce(handleSearch, DEBOUNCE_DELAY)
);