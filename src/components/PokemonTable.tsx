"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getPokemon } from "@/lib/api";

interface Pokemon {
  name: string;
  url: string;
}

export default function PokemonTable() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPokemon();
      setPokemonList(Array.isArray(res) ? res : res.data || []);
    } catch (e) {
      setError("Gagal memuat data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      {/* Add your Pokemon table or list component here */}
    </div>
  );
}
