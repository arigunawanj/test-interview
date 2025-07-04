"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getPokemon, getPokemonDetail } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
type Ability = { name: string; url: string };
type EffectEntry = { effect: string; language: { name: string } };
type AbilityDetail = { effect_entries: EffectEntry[]; name: string };

export default function PokemonPage() {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Ability | null>(null);
  const [detail, setDetail] = useState<AbilityDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch list
  useEffect(() => {
    setLoading(true);
    getPokemon()
      .then(setAbilities)
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch detail
  function fetchDetail(url: string) {
    setDetailLoading(true);
    getPokemonDetail(url)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }

  // Filtered abilities
  const filtered = abilities.filter((a) => a.name.includes(search));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pokémon Abilities</h1>
      <Input
        placeholder="Cari ability..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs mb-4"
      />
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="flex flex-col-reverse md:flex-row gap-10">
          <div className="mb-6 w-full md:w-1/2" >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/3">Ability</TableHead>
                  <TableHead className="w-2/3">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              {filtered.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-gray-500"
                    >
                      Tidak ada ability ditemukan.
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : null}

              <TableBody>
                {filtered.map((a, i) => (
                  <TableRow>
                    <TableCell className="font-medium capitalize">{a.name}</TableCell>
                    <TableCell>
                      <Button
                        variant={
                          selected?.name === a.name ? "default" : "outline"
                        }
                        onClick={() => {
                          setSelected(a);
                          fetchDetail(a.url);
                        }}
                        className=""
                      >
                        Pilih
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Detail */}
          <div className="w-full md:w-1/2">
          {selected === null && (
            <Card className="mt-4 w-1/2">
              <CardContent className="py-4">
                <h1 className="text-3xl text-center font-bold">Silahkan Pilih Ability</h1>
              </CardContent>
            </Card>
            )}
          {selected && (
            <Card className="mt-4 w-full shadow-lg border-primary/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl text-center font-bold capitalize">{selected.name}</span>
                  <span className="bg-red-100 text-red-800 text-xs font-medium me-2 mt-3 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">Ability</span>
                </div>
                {detailLoading ? (
                  <Skeleton className="h-8" />
                ) : detail ? (
                  <div>
                    <div className="mb-2 text-sm text-gray-500">
                      Effect Entries:
                    </div>
                    <ul className="list-disc pl-5">
                      {detail.effect_entries
                        .filter((e) => e.language.name === "en")
                        .map((e, i) => (
                          <li key={i}>{e.effect}</li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-gray-400">Tidak ada detail.</div>
                )}
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
