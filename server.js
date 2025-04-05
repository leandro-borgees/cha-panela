const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const reservasFilePath = path.join(__dirname, 'reservas.json');
// Criar arquivo se não existir
if (!fs.existsSync(reservasFilePath)) {
  fs.writeFileSync(reservasFilePath, '[]');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Funções auxiliares atualizadas
function lerReservas() {
  try {
    return JSON.parse(fs.readFileSync(reservasFilePath, 'utf8'));
  } catch (err) {
    console.error('Erro ao ler reservas:', err);
    return [];
  }
}

function salvarReservas(reservas) {
  try {
    fs.writeFileSync(reservasFilePath, JSON.stringify(reservas, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao salvar reservas:', err);
    throw new Error('Erro interno no servidor');
  }
}

app.get('/reservas', (req, res) => {
  try {
    const reservas = lerReservas();
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter reservas' });
  }
});

// Endpoint POST atualizado
app.post('/reservas', (req, res) => {
  try {
    const { id, nome, preco, usuario } = req.body;
    
    if (!id || !nome || !usuario) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const reservas = lerReservas();
    
    if (reservas.some(r => r.id === id)) {
      return res.status(409).json({ error: 'Item já reservado' });
    }

    reservas.push({
      id,
      nome,
      preco: preco || 'Não especificado',
      usuario,
      data: new Date().toISOString()
    });

    salvarReservas(reservas);
    res.status(201).json({ success: true, reserva: reservas[reservas.length - 1] });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    res.status(500).json({ 
      error: error.message || 'Erro interno no servidor' 
    });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));