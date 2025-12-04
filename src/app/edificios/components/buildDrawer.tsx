'use client';
import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { Dispatch, SetStateAction } from 'react';
import { structures, Structure } from '../utils/StructuresData';

interface BuildingDrawerProps {
  open: boolean;
  onClose: () => void;
  onBuild: (cost: { gold?: number; money?: number; food?: number; lumber?: number; stone?: number }) => void;
  setStructure: Dispatch<SetStateAction<number | null>>;
  playerLevel: number;
  ayuntamientoArray: Structure[]; 
}

const DrawerContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#001f3f',
  color: '#fff',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: 200,
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.3s ease, opacity 0.3s ease',
  '&:hover': {
    opacity: 0.8,
    transform: 'scale(1.05)',
  },
  cursor: 'pointer',
}));

const StyledMedia = styled(CardMedia)({
  height: 140,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
});

const BuildingDrawer: React.FC<BuildingDrawerProps> = ({ open, onClose, onBuild, setStructure, playerLevel, ayuntamientoArray }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<Structure | null>(null);

  // Verificar si ya existe un ayuntamiento
  const hasTownHall = ayuntamientoArray.length > 0;


  // Filtrar estructuras disponibles
  const availableStructures = structures.filter((building) => {
    // Si ya existe ayuntamiento, no permitimos construir otro
    if (building.type === 'ayuntamiento' && hasTownHall) {
      return false;
    }
    // El resto se muestra si el jugador tiene el nivel requerido
    return building.desbloqueo <= playerLevel;
  });
 

  const handleCardClick = (building: Structure) => {
    if (building.desbloqueo <= playerLevel) {
      if (building.type === 'ayuntamiento' && hasTownHall) {
        alert('Solo puedes construir un ayuntamiento.');
        return;
      }
      setSelectedBuilding(building);
    } else {
      alert(`Necesitas estar en nivel ${building.desbloqueo} para construir ${building.name}`);
    }
  };

  const handleCloseDialog = () => {
    setSelectedBuilding(null);
  };

  const handleBuild = () => {
    if (selectedBuilding) {
      setStructure(selectedBuilding.id);
      onBuild(selectedBuilding.cost);
      handleCloseDialog();
    }
  };

  return (
    <>
      <Drawer anchor="bottom" open={open} onClose={onClose}>
        <DrawerContainer>
          <Grid container justifyContent="center">
            {availableStructures.map((building) => (
              <Grid item key={building.id}>
                <StyledCard onClick={() => handleCardClick(building)}>
                  {/* CardMedia */}
                  <StyledMedia image={building.spriteImage} title={building.name} />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h2" style={{ color: '#fff' }}>
                      {building.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p" style={{ color: '#ddd' }}>
                      Costo: {[
                        building.cost.gold ? `Oro: ${building.cost.gold}` : null,
                        building.cost.money ? `Dinero: ${building.cost.money}` : null,
                        building.cost.food ? `Comida: ${building.cost.food}` : null,
                        building.cost.lumber ? `Madera: ${building.cost.lumber}` : null,
                        building.cost.stone ? `Piedras: ${building.cost.stone}` : null,
                      ].filter(Boolean).join(', ')}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </DrawerContainer>
      </Drawer>

      {selectedBuilding && (
        <Dialog open={Boolean(selectedBuilding)} onClose={handleCloseDialog}>
          <DialogTitle>{selectedBuilding.name}</DialogTitle>
          <DialogContent>
            <div style={{ width: '100%', height: 140, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={selectedBuilding.spriteImage} alt={selectedBuilding.name} style={{ maxHeight: 140, objectFit: 'contain' }} />
            </div>
            <Typography variant="body1" style={{ marginTop: 16 }}>
              Costo: {[
                selectedBuilding.cost.gold ? `Oro: ${selectedBuilding.cost.gold}` : null,
                selectedBuilding.cost.money ? `Dinero: ${selectedBuilding.cost.money}` : null,
                selectedBuilding.cost.food ? `Comida: ${selectedBuilding.cost.food}` : null,
                selectedBuilding.cost.lumber ? `Madera: ${selectedBuilding.cost.lumber}` : null,
                selectedBuilding.cost.stone ? `Piedras: ${selectedBuilding.cost.stone}` : null,
              ].filter(Boolean).join(', ')}
            </Typography>
            {selectedBuilding.produccion_hora && (
              <Typography variant="body1" style={{ marginTop: 16 }}>
                Producción por hora: {selectedBuilding.produccion_hora}
              </Typography>
            )}
            {selectedBuilding.level && (
              <Typography variant="body1" style={{ marginTop: 0 }}>
                Nivel: {selectedBuilding.level}
              </Typography>
            )}
            {selectedBuilding.obreros && (
              <Typography variant="body1" style={{ marginTop: 0 }}>
                Obreros: {selectedBuilding.obreros}
              </Typography>
            )}
            {selectedBuilding.aldeanos_por_casa && (
              <Typography variant="body1" style={{ marginTop: 0 }}>
                Aumenta población: {selectedBuilding.aldeanos_por_casa}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleBuild} color="primary">
              Construir
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default React.memo(BuildingDrawer);

