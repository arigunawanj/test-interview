"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

type Product = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
};

const dataAwal: Product[] = [
  {
    id: 1,
    nama: "Minuman Botol",
    harga: 5000,
    stok: 5,
  },
  {
    id: 2,
    nama: "Makanan Ringan",
    harga: 1000,
    stok: 10,
  },
  {
    id: 3,
    nama: "Tisu Basah",
    harga: 7000,
    stok: 2,
  },
  {
    id: 4,
    nama: "Kaca Pembersih",
    harga: 16000,
    stok: 7,
  },
];

// Komponen CurrencyInput untuk input harga dengan format ribuan, prefix 'Rp', dan 2 desimal
function CurrencyInput({ value, onChange, ...props }: any) {
  const [displayValue, setDisplayValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value]);

  function formatValue(val: string) {
    if (!val) return "";
    let clean = val.replace(/[^0-9]/g, "");
    if (!clean) return "";
    let num = parseInt(clean, 10) / 100;
    if (isNaN(num)) return "";
    return num.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/[^0-9]/g, "");
    let num = parseInt(raw, 10) || 0;
    let formatted = (num / 100).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setDisplayValue(formatted);
    onChange((num / 100).toFixed(2)); // kirim string angka dengan dua desimal ke parent
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500">Rp</span>
      <Input
        {...props}
        ref={inputRef}
        value={displayValue}
        onChange={handleChange}
        inputMode="numeric"
        className="pl-2"
      />
    </div>
  );
}

export default function Home() {
  // Use State untuk Produk
  const [products, setProducts] = useState<Product[]>(dataAwal);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Filter, Sort dan Debouce search
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("default");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // State Loading dan Show Form
  const [showForm, setShowForm] = useState(false);
  const idRef = useRef(dataAwal.length + 1);

  // Fitur Debounce dengan delay 300ms
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let data = products.filter((p) =>
      p.nama.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    if (sort === "price-asc")
      data = [...data].sort((a, b) => a.harga - b.harga);
    if (sort === "price-desc")
      data = [...data].sort((a, b) => b.harga - a.harga);
    if (sort === "stock-asc") data = [...data].sort((a, b) => a.stok - b.stok);
    if (sort === "stock-desc") data = [...data].sort((a, b) => b.stok - a.stok);
    return data;
  }, [products, debouncedSearch, sort]);

  // Form awal
  const form = useForm({
    defaultValues: { nama: "", harga: "", stok: "" },
  });

  useEffect(() => {
    if (editProduct) {
      form.reset({
        nama: editProduct.nama,
        harga: editProduct.harga.toString(),
        stok: editProduct.stok.toString(),
      });
    } else {
      form.reset({ nama: "", harga: "", stok: "" });
    }
  }, [editProduct, form]);

  // Validasi nama yang sudahada
  const isNameUnique = (nama: string, id: number | null = null) => {
    return !products.some(
      (p) => p.nama.toLowerCase() === nama.toLowerCase() && p.id !== id
    );
  };

  const currencyFormatter = new Intl.NumberFormat(window.navigator.language, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  });

  // Submit form dan Validasi
  const onSubmit = (data: { nama: string; harga: string; stok: string }) => {
    // Jika namanya sudah terdaftar
    if (!isNameUnique(data.nama, editProduct?.id ?? null)) {
      form.setError("nama", { message: "Nama produk sudah terdaftar" });
      return;
    }

    // jika harga dibawah 0 atau minus
    const hargaNumber = parseFloat(data.harga.replace(/[^0-9.,]/g, "").replace(",", "."));
    if (hargaNumber <= 0 || isNaN(hargaNumber)) {
      form.setError("harga", { message: "Harga tidak boleh 0" });
      return;
    }
    // jika stok dibawah 0 atau minus
    if (+data.stok < 10) {
      form.setError("stok", {
        message: "Stok tidak boleh minus atau dibawah 10",
      });
      return;
    }
    // Jika semua validasi lolos, simpan produk
    if (editProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id
            ? { ...p, nama: data.nama, harga: hargaNumber, stok: +data.stok }
            : p
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        {
          id: idRef.current++,
          nama: data.nama,
          harga: hargaNumber,
          stok: +data.stok,
        },
      ]);
    }
    setShowForm(false);
    setEditProduct(null);
    form.reset({ nama: "", harga: "", stok: "" });
  };

  // Hapus produk
  function handleDelete() {
    if (!deleteProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
    setDeleteProduct(null);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs hidden md:block"
        />
        <Select onValueChange={setSort} value={sort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">Harga Termurah</SelectItem>
            <SelectItem value="price-desc">Harga Termahal</SelectItem>
            <SelectItem value="stock-asc">Stok Terendah</SelectItem>
            <SelectItem value="stock-desc">Stok Tertinggi</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditProduct(null);
          }}
          className="ml-auto"
        >
          Tambah Produk
        </Button>
      </div>
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Tidak ada produk.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="relative">
              <CardContent className="pt-4 pb-2">
                <div className="text-xs text-gray-400 mb-2">Stok: {p.stok}</div>
                <img
                  src="https://placehold.co/600x400/EEE/31343C"
                  alt="gambar"
                />
                <div className="font-bold text-center text-lg mb-1">
                  {p.nama}
                </div>
                <div className="text-sm font-bold text-center mb-1">
                  Rp{p.harga.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="flex gap-2 mt-2 items-center justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowForm(true);
                      setEditProduct(p);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteProduct(p)}
                  >
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Modal Form Tambah/Edit */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editProduct ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="harga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok</FormLabel>
                    <FormControl>
                      <Input type="number" min={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {editProduct ? "Simpan" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Modal Konfirmasi Hapus */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Yakin ingin menghapus produk <b>{deleteProduct?.nama}</b>?
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
