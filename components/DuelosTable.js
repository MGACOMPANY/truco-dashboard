export default function DuelosTable({ data }) {
    return (
      <table border="1">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Entrada</th>
            <th>Premio</th>
            <th>Jugadores</th>
            <th>Comisión</th>
            <th>Fecha</th>
            <th>Grupo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((duelo) => (
            <tr key={duelo.id}>
              <td>{duelo.tipo}</td>
              <td>{duelo.entrada}</td>
              <td>{duelo.premio}</td>
              <td>{duelo.jugadores}</td>
              <td>{duelo.comision}</td>
              <td>{duelo.fecha}</td>
              <td>{duelo.grupo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
  