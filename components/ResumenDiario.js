export default function ResumenDiario({ data }) {
    if (!data) return <p>No hay resumen cargado</p>
  
    return (
      <div>
        <h3>Resumen del {data.fecha}</h3>
        <p>Total entradas: {data.total_entradas}</p>
        <p>Total premios: {data.total_premios}</p>
        <p>Comisión total: {data.total_comision}</p>
      </div>
    )
  }
  