El cambio. lo principal que se vería afectado es la HU-01. Se le debe crear un nuevo criterio de aceptación "CA7" la venta queda pendiente de confirmación si algún insumo de la receta no alcanza y se debería anular la D1. Además se deberá crear una nueva HU-08 la cual debe ser la de gestionar ventas pendientes de insumos, ver pendientes, confirmar con stock suficiente, rechazar la confirmación sin stock suficiente, cancelar.

Cambiaria el modelo de dominio, dado que venta deberá tener un nuevo atributo el cual será estado, y este deberá contener: Confirmada, pendiente de confirmación o cancelada.

Los cambios de usos igual se ven afectados, el CU-01 se vera modificado dado que deberá contener un nuevo resultado el cual será "Venta pendiente". Ademas se le deberán crear nuevos casos de usos el cual será CU-12 para confirmar venta pendiente , CU-13 cancelar venta pendiente, CU-14 Consultar ventas pendientes. Y todos estos del administrador.

en la secuencia se debera modificar la DSS-01 gana una variante alt dentro del loop: stock suficiente / stock insuficiente. se deberá crear DSS-07 para confirmar (con rechazo si todavía no alcanza) y además se deberá crear DSS-08 para cancelar.

en el estado se deberá crear uno nuevo EST-03, ciclo de vida de Venta. se debera modificar el EST-01 (Insumo) y este cambia lo siguiente: la guarda de Pedido confirmado ahora exige stock suficiente y aparece un evento nuevo, Confirmar venta pendiente, que descuenta. EST-02 (AlertaDeStock) cambia: la alerta también puede nacer

y en la trazabilidad se deben crear filas nuevas (CU, DSS, EST, HU nuevas), RP-01, RP-02, RP-08 y RP-09 actualizadas, y se reemplaza la observación sobre stock negativo (D1).

y por ultimo los requisitos RP-01 modificado y un RP nuevo para la retención de la venta pendiente. 
