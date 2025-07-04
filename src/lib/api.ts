import axios from "axios";

const API_POKEMON = "https://pokeapi.co/api/v2";

const api = axios.create({
  baseURL: API_POKEMON,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getPokemon() {
  try {
    const res = await api.get("/ability?limit=20&offset=0");
    return res.data.results;
  } catch (err: any) {
    return err.response?.data || { message: "Gagal memuat data" };
  }
}

export async function getPokemonDetail(url: string) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err: any) {
    return err.response?.data || { message: "Gagal memuat detail Pokemon" };
  }
}
