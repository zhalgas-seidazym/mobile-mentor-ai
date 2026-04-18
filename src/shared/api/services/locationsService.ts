import { apiClient } from '../client';
import {
  CountryDTO,
  CityDTO,
  PaginatedResponse,
  PaginationParams,
} from '../types';

interface SearchCountriesParams extends PaginationParams {
  q?: string;
}

interface SearchCitiesParams extends PaginationParams {
  q?: string;
  country_id?: number;
  populate_country?: boolean;
}

interface GetCityParams {
  populate_country?: boolean;
}

export const locationsService = {
  async searchCountries(params?: SearchCountriesParams): Promise<PaginatedResponse<CountryDTO>> {
    const response = await apiClient.get<PaginatedResponse<CountryDTO>>('/locations/country', {
      params,
    });
    return response.data;
  },

  async getCountry(countryId: number): Promise<CountryDTO> {
    const response = await apiClient.get<CountryDTO>(`/locations/country/${countryId}`);
    return response.data;
  },

  async searchCities(params?: SearchCitiesParams): Promise<PaginatedResponse<CityDTO>> {
    const response = await apiClient.get<PaginatedResponse<CityDTO>>('/locations/city', {
      params,
    });
    return response.data;
  },

  async getCity(cityId: number, params?: GetCityParams): Promise<CityDTO> {
    const response = await apiClient.get<CityDTO>(`/locations/city/${cityId}`, { params });
    return response.data;
  },
};
