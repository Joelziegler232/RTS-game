// src/app/mercado/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Resource {
  resource: string;
  amount: number;
}

export default function MercadoPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [tab, setTab] = useState<'convert' | 'trade'>('convert');

  // PESTAÑA CONVERTIR
  const [from, setFrom] = useState<string>("money");
  const [to, setTo] = useState<string>("lumber");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // PESTAÑA COMERCIO REAL
  const [searchName, setSearchName] = useState('');
  const [offer, setOffer] = useState({ lumber: 0, stone: 0, food: 0, gold: 0, money: 0 });
  const [request, setRequest] = useState({ lumber: 0, stone: 0, food: 0, gold: 0, money: 0 });
  const [pendingOffers, setPendingOffers] = useState<any[]>([]);

  const resourceOptions = ["money", "gold", "lumber", "stone", "food"] as const;

  const exchangeRates: Record<string, Record<string, number>> = {
    money: { gold: 0.2, lumber: 1.5, stone: 1.2, food: 2 },
    gold: { money: 5, lumber: 7, stone: 6, food: 10 },
    lumber: { money: 0.66, gold: 0.14, stone: 0.8, food: 1.3 },
    stone: { money: 0.83, gold: 0.16, lumber: 1.25, food: 1.6 },
    food: { money: 0.5, gold: 0.1, lumber: 0.77, stone: 0.62 },
  };

  // CORREGIDO: useCallback + dependencias correctas
  const fetchResources = useCallback(async () => {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/user_instance/${session.user.id}`);
    if (res.ok) {
      const data = await res.json();
      setResources(data.resources || []);
    }
  }, [session?.user?.id]);

  const fetchPendingOffers = useCallback(async () => {
    const res = await fetch('/api/trade/offers');
    if (res.ok) setPendingOffers(await res.json());
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchResources();
      if (tab === 'trade') fetchPendingOffers();
    }
  }, [session?.user?.id, tab, fetchResources, fetchPendingOffers]);

  const handleExchange = async () => {
    setMessage("");
    if (!amount || +amount <= 0) return setMessage("Cantidad inválida");
    if (from === to) return setMessage("No puedes convertir lo mismo");

    const numAmount = parseFloat(amount);
    const rate = exchangeRates[from][to] || 0;
    const cost = numAmount;
    const gain = numAmount * rate;

    const fromRes = resources.find(r => r.resource === from);
    if (!fromRes || fromRes.amount < cost) return setMessage(`No tienes suficiente ${from}`);

    const updated = resources.map(r => {
      if (r.resource === from) return { ...r, amount: r.amount - cost };
      if (r.resource === to) return { ...r, amount: r.amount + gain };
      return r;
    });

    const res = await fetch(`/api/user_instance/${session?.user?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resources: updated }),
    });

    if (res.ok) {
      setMessage(`+${gain.toFixed(1)} ${to}`);
      setAmount("");
      fetchResources();
    } else {
      setMessage("Error al convertir");
    }
  };

  const sendOffer = async () => {
    setMessage("");
    if (!searchName.trim()) return setMessage("Nombre requerido");
    const totalOffer = Object.values(offer).reduce((a, b) => a + b, 0);
    const totalRequest = Object.values(request).reduce((a, b) => a + b, 0);
    if (totalOffer === 0 || totalRequest === 0) return setMessage("Ofrece y pide algo");

    const res = await fetch('/api/trade/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUsername: searchName, offer, request }),
    });

    const data = await res.json();
    setMessage(res.ok ? "Oferta enviada!" : data.error || "Error");
    if (res.ok) {
      setSearchName('');
      setOffer({ lumber: 0, stone: 0, food: 0, gold: 0, money: 0 });
      setRequest({ lumber: 0, stone: 0, food: 0, gold: 0, money: 0 });
      fetchPendingOffers();
      fetchResources();
    }
  };

  const acceptOffer = async (id: string) => {
    const res = await fetch(`/api/trade/offer/${id}/accept`, { method: 'POST' });
    const data = await res.json();
    setMessage(res.ok ? "Intercambio aceptado!" : data.error || "Error");
    if (res.ok) {
      fetchPendingOffers();
      fetchResources();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-8">
          <Image src="/mercado.png" alt="Mercado Global" width={120} height={120} />
          <div>
            <h1 className="text-6xl font-bold text-yellow-500">MERCADO GLOBAL</h1>
            
          </div>
        </div>

        <div className="flex gap-8 justify-center mb-10">
          <button onClick={() => setTab('convert')} className={`px-12 py-5 text-3xl font-bold rounded-xl ${tab === 'convert' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            Convertir Recursos
          </button>
          <button onClick={() => setTab('trade')} className={`px-12 py-5 text-3xl font-bold rounded-xl ${tab === 'trade' ? 'bg-green-600' : 'bg-gray-700'}`}>
            Comercio entre Jugadores
          </button>
        </div>

        {tab === 'convert' && (
          <div className="bg-gray-800 rounded-2xl p-10 shadow-2xl">
            <h2 className="text-4xl mb-8 text-center">Convertir Recursos</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <label htmlFor="from-resource" className="block text-2xl mb-4">De</label>
                <select
                  id="from-resource"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full p-6 text-2xl bg-gray-700 rounded-xl"
                  aria-label="Recurso de origen"
                >
                  {resourceOptions.map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="to-resource" className="block text-2xl mb-4">A</label>
                <select
                  id="to-resource"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full p-6 text-2xl bg-gray-700 rounded-xl"
                  aria-label="Recurso de destino"
                >
                  {resourceOptions.filter(r => r !== from).map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount-input" className="block text-2xl mb-4">Cantidad</label>
                <input
                  id="amount-input"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="100"
                  className="w-full p-6 text-2xl bg-gray-700 rounded-xl"
                  aria-label="Cantidad a convertir"
                />
              </div>
            </div>

            {amount && !isNaN(+amount) && (
              <p className="text-center text-4xl mt-8 text-yellow-400">
                {amount} {from} → {(parseFloat(amount) * (exchangeRates[from][to] || 0)).toFixed(1)} {to}
              </p>
            )}

            <div className="text-center mt-10">
              <button onClick={handleExchange} className="px-20 py-8 bg-yellow-600 hover:bg-yellow-700 text-4xl font-bold rounded-2xl">
                CONVERTIR
              </button>
            </div>
          </div>
        )}

        {tab === 'trade' && (
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-gray-800 p-10 rounded-2xl">
              <h2 className="text-4xl mb-8 text-green-400">Enviar Oferta</h2>
              <div className="mb-8">
                <label htmlFor="player-name" className="block text-2xl mb-4">Nombre del jugador</label>
                <input
                  id="player-name"
                  type="text"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  placeholder="Nombre exacto"
                  className="w-full p-6 text-2xl bg-gray-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl text-yellow-400 mb-6">Ofrezco</h3>
                  {(['lumber', 'stone', 'food', 'gold', 'money'] as const).map(r => (
                    <div key={r} className="flex items-center gap-4 mb-4">
                      <label htmlFor={`offer-${r}`} className="w-32 text-xl capitalize">{r}:</label>
                      <input
                        id={`offer-${r}`}
                        type="number"
                        min="0"
                        value={offer[r]}
                        onChange={e => setOffer({...offer, [r]: +e.target.value || 0})}
                        className="w-40 p-4 text-xl bg-gray-600 rounded"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-3xl text-cyan-400 mb-6">Pido</h3>
                  {(['lumber', 'stone', 'food', 'gold', 'money'] as const).map(r => (
                    <div key={r} className="flex items-center gap-4 mb-4">
                      <label htmlFor={`request-${r}`} className="w-32 text-xl capitalize">{r}:</label>
                      <input
                        id={`request-${r}`}
                        type="number"
                        min="0"
                        value={request[r]}
                        onChange={e => setRequest({...request, [r]: +e.target.value || 0})}
                        className="w-40 p-4 text-xl bg-gray-600 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={sendOffer} className="mt-10 w-full py-8 bg-green-600 hover:bg-green-700 text-4xl font-bold rounded-2xl">
                ENVIAR OFERTA
              </button>
            </div>

            <div className="bg-gray-800 p-10 rounded-2xl">
              <h2 className="text-4xl mb-8 text-yellow-400">Ofertas Pendientes</h2>
              {pendingOffers.length === 0 ? (
                <p className="text-2xl text-gray-400 text-center py-20">No hay ofertas pendientes</p>
              ) : (
                pendingOffers.map(o => (
                  <div key={o._id} className="bg-gray-700 p-8 rounded-2xl mb-6">
                    <p className="text-2xl font-bold mb-2">
                      {o.fromUser.fullname} → {o.toUser.fullname}
                    </p>
                    <p className="text-xl mb-1">
                      Ofrece: {Object.entries(o.fromResources).map(([k,v]: any) => v>0 && `${v} ${k}`).filter(Boolean).join(', ')}
                    </p>
                    <p className="text-xl mb-4">
                      Pide: {Object.entries(o.toResources).map(([k,v]: any) => v>0 && `${v} ${k}`).filter(Boolean).join(', ')}
                    </p>
                    {o.toUser._id.toString() === session?.user?.id && (
                      <button onClick={() => acceptOffer(o._id)} className="px-12 py-6 bg-green-600 hover:bg-green-700 text-3xl font-bold rounded-xl">
                        ACEPTAR OFERTA
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {message && (
          <p className={`text-center text-5xl mt-16 font-black transition-all duration-500 animate-pulse
            ${message.includes("Oferta") || 
              message.includes("aceptado") || 
              message.includes("exitoso") || 
              message.includes("enviada") || 
              message.includes("+") || 
              message.startsWith("+")
              ? "text-green-400 drop-shadow-lg" 
              : "text-red-400 drop-shadow-lg"}`}>
            {message}
          </p>
        )}


        <div className="text-center mt-20">
          <button onClick={() => window.location.href = "/edificios"} className="px-20 py-10 bg-red-600 hover:bg-red-700 text-5xl font-black rounded-3xl shadow-2xl">
            VOLVER 
          </button>
        </div>
      </div>
    </div>
  );
}