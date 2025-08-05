// src/app/components/MapViewer.tsx
import React, { useState, useEffect } from "react";
import { fetchMaps, createMap } from "../../services/mapService";

const MapViewer: React.FC = () => {
  const [maps, setMaps] = useState<any[]>([]);
  const [selectedMap, setSelectedMap] = useState<any | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      const data = await fetchMaps();
      setMaps(data);
    };
    loadMaps();
  }, []);

  const handleGenerateMap = async () => {
    const newMap = await createMap();
    setMaps([newMap, ...maps]);
    setSelectedMap(newMap);
  };

  return (
    <div>
      <h1>Map Viewer</h1>
      <button onClick={handleGenerateMap}>Generate New Map</button>
      <div>
        <h2>Available Maps</h2>
        <ul>
          {maps.map((map, index) => (
            <li key={index} onClick={() => setSelectedMap(map)}>
              Map {index + 1} (Created: {new Date(map.createdAt).toLocaleString()})
            </li>
          ))}
        </ul>
      </div>
      {selectedMap && (
        <div>
          <h2>Selected Map</h2>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${selectedMap.grid.length}, 20px)` }}>
            {selectedMap.grid.flat().map((cell: string, index: number) => (
              <div
                key={index}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor:
                    cell === "water" ? "blue" :
                    cell === "plains" ? "green" :
                    cell === "forest" ? "darkgreen" :
                    "gray",
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewer;
