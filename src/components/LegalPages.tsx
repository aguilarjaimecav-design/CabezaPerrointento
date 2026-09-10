import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileText, Printer } from 'lucide-react';

function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

const LEGAL_LINKS: { to: string; label: string }[] = [
  { to: '/aviso-legal', label: 'Aviso legal' },
  { to: '/politica-privacidad', label: 'Política de privacidad' },
  { to: '/politica-cookies', label: 'Política de cookies' },
  { to: '/condiciones-compra', label: 'Condiciones de compra' },
  { to: '/devoluciones-y-desistimiento', label: 'Devoluciones y desistimiento' },
  { to: '/reservas-y-cancelaciones', label: 'Reservas y cancelaciones' },
  { to: '/envios-y-entregas', label: 'Envíos y entregas' },
  { to: '/atencion-al-cliente-y-reclamaciones', label: 'Atención al cliente y reclamaciones' },
];

function LegalLayout({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="animate-fadeIn">
      <div className="page-heading">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <p className="eyebrow">Información legal</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-primary-800 md:text-5xl">{title}</h1>
          {updated && <p className="mt-3 text-sm text-secondary-500">Última actualización: {updated}</p>}
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <article className="legal-content">{children}</article>
        <div className="mt-12 border-t border-cream-300 pt-8">
          <h2 className="font-serif text-lg text-primary-800">Documentos legales</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={scrollTop} className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition hover:text-accent-700">
                  <ArrowRight size={14} className="text-accent-600" /> {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/" onClick={scrollTop} className="button-text mt-6">Volver al inicio <ArrowRight size={15} /></Link>
        </div>
      </div>
    </div>
  );
}

function LegalH2({ children }: { children: ReactNode }) { return <h2 className="font-serif text-2xl text-primary-800 mt-10 mb-3">{children}</h2>; }
function LegalH3({ children }: { children: ReactNode }) { return <h3 className="font-serif text-lg font-semibold text-primary-800 mt-6 mb-2">{children}</h3>; }
function LegalP({ children }: { children: ReactNode }) { return <p className="text-sm leading-7 text-secondary-700 mb-4">{children}</p>; }
function LegalLI({ children }: { children: ReactNode }) { return <li className="text-sm leading-7 text-secondary-700 ml-5 list-disc">{children}</li>; }

export function AvisoLegal() {
  return (
    <LegalLayout title="Aviso legal" updated="10 de septiembre de 2026">
      <LegalH2>1. Datos identificativos</LegalH2>
      <LegalP>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informan a los usuarios los siguientes datos del titular de este sitio web:
      </LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Titular:</strong> CabezaPerro</LegalLI>
        <LegalLI><strong>Domicilio:</strong> Sevilla, España</LegalLI>
        <LegalLI><strong>Email:</strong> cabezaperro015@gmail.com</LegalLI>
        <LegalLI><strong>Teléfono:</strong> +34 644 789 324</LegalLI>
        <LegalLI><strong>Sitio web:</strong> https://www.cabezaperro.com</LegalLI>
      </ul>
      <LegalH2>2. Objeto y ámbito</LegalH2>
      <LegalP>
        El presente aviso legal regula el uso del sitio web https://www.cabezaperro.com, a través del cual CabezaPerro ofrece información sobre sus productos de alimentación para perros y gatos, servicios de paseos y cuidados, y la posibilidad de realizar compras y reservas online.
      </LegalP>
      <LegalP>
        La navegación por el sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este aviso legal, así como de la política de privacidad, la política de cookies, las condiciones de compra y demás documentos legales publicados en este sitio.
      </LegalP>
      <LegalH2>3. Acceso y uso del sitio</LegalH2>
      <LegalP>
        El acceso al sitio web es libre y gratuito, salvo en aquellos contenidos que requieran el cumplimiento de formularios o procesos de compra. CabezaPerro se reserva el derecho a modificar, suspender o interrumpir el funcionamiento del sitio web en cualquier momento y sin previo aviso.
      </LegalP>
      <LegalP>
        El usuario se compromete a utilizar el sitio web de conformidad con la ley, con el presente aviso legal y con la moral y buenas costumbres. Queda prohibido cualquier uso que pueda dañar, sobrecargar, deteriorar o impedir la normal utilización del sitio web.
      </LegalP>
      <LegalH2>4. Propiedad intelectual e industrial</LegalH2>
      <LegalP>
        Todos los contenidos del sitio web (incluidos, a título enunciativo, textos, fotografías, gráficos, imágenes, iconos, tecnología, software, así como su diseño gráfico y códigos fuente) son propiedad intelectual e industrial de CabezaPerro o de terceros que han autorizado su uso, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación reconocidos por la normativa vigente.
      </LegalP>
      <LegalP>
        Queda prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra forma de explotación, total o parcial, de los contenidos del sitio web sin autorización expresa de CabezaPerro.
      </LegalP>
      <LegalH2>5. Responsabilidad</LegalH2>
      <LegalP>
        CabezaPerro no garantiza la inexistencia de errores en el acceso al sitio web ni que este se encuentre permanentemente disponible. En la medida permitida por la legislación aplicable, CabezaPerro no asume responsabilidad alguna por los daños y perjuicios de toda naturaleza que pudieran derivarse del uso del sitio web o de la información contenida en él.
      </LegalP>
      <LegalP>
        CabezaPerro podrá modificar el contenido del sitio web o introducir nuevos productos o servicios en cualquier momento y sin previo aviso. Asimismo, no garantiza que los productos mostrados estén siempre disponibles o que sus precios sean inalterables.
      </LegalP>
      <LegalH2>6. Enlaces externos</LegalH2>
      <LegalP>
        El sitio web puede contener enlaces a sitios web de terceros. CabezaPerro no se responsabiliza del contenido ni del funcionamiento de los sitios enlazados, ni de los productos o servicios que en ellos se ofrezcan. El acceso a los enlaces externos se realiza bajo la exclusiva responsabilidad del usuario.
      </LegalP>
      <LegalH2>7. Legislación aplicable y jurisdicción</LegalH2>
      <LegalP>
        El presente aviso legal se rige por la legislación española. Para la resolución de cualquier conflicto derivado o relacionado con el uso del sitio web, CabezaPerro y el usuario se someten a los juzgados y tribunales de Sevilla, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
      </LegalP>
    </LegalLayout>
  );
}

export function PoliticaPrivacidad() {
  return (
    <LegalLayout title="Política de privacidad" updated="10 de septiembre de 2026">
      <LegalH2>1. Responsable del tratamiento</LegalH2>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Titular:</strong> CabezaPerro</LegalLI>
        <LegalLI><strong>Domicilio:</strong> Sevilla, España</LegalLI>
        <LegalLI><strong>Email:</strong> cabezaperro015@gmail.com</LegalLI>
        <LegalLI><strong>Teléfono:</strong> +34 644 789 324</LegalLI>
      </ul>
      <LegalH2>2. Finalidad del tratamiento</LegalH2>
      <LegalP>Los datos personales que el usuario facilita a través de los formularios del sitio web se tratan con las siguientes finalidades:</LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI>Gestión de pedidos de compra realizados en la tienda online, incluyendo el cálculo del envío, el procesamiento del pago y la entrega de los productos.</LegalLI>
        <LegalLI>Gestión de reservas del servicio de paseos y cuidados para perros.</LegalLI>
        <LegalLI>Atención de consultas y mensajes enviados a través del formulario de contacto.</LegalLI>
        <LegalLI>Envío de confirmaciones de pedido y reserva, incluido el envío del ticket o comprobante por correo electrónico.</LegalLI>
        <LegalLI>Cumplimiento de las obligaciones legales aplicables a CabezaPerro.</LegalLI>
      </ul>
      <LegalH2>3. Legitimación</LegalH2>
      <LegalP>
        El tratamiento de los datos personales se basa en el consentimiento del usuario al rellenar y enviar los formularios del sitio web (artículo 6.1.a del Reglamento (UE) 2016/679 — RGPD), así como en la necesidad de los datos para la ejecución de un contrato o precontractual (artículo 6.1.b del RGPD) en el caso de pedidos y reservas.
      </LegalP>
      <LegalH2>4. Conservación de los datos</LegalH2>
      <LegalP>
        Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados y, en todo caso, durante los plazos legalmente requeridos para atender posibles responsabilidades derivadas del tratamiento.
      </LegalP>
      <LegalH2>5. Destinatarios</LegalH2>
      <LegalP>
        Los datos personales no serán cedidos a terceros, salvo por obligación legal. CabezaPerro utiliza los servicios de proveedores de alojamiento, pasarelas de pago y envío de correos electrónicos, que actúan como encargados del tratamiento bajo las garantías y contratos exigidos por el RGPD.
      </LegalP>
      <LegalH2>6. Derechos de los usuarios</LegalH2>
      <LegalP>El usuario tiene derecho a:</LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI>Acceder a sus datos personales tratados por CabezaPerro.</LegalLI>
        <LegalLI>Solicitar la rectificación de datos inexactos o incompletos.</LegalLI>
        <LegalLI>Solicitar la supresión de sus datos cuando ya no sean necesarios.</LegalLI>
        <LegalLI>Solicitar la limitación del tratamiento de sus datos.</LegalLI>
        <LegalLI>Oponerse al tratamiento de sus datos por motivos legítimos.</LegalLI>
        <LegalLI>Solicitar la portabilidad de sus datos a otro responsable.</LegalLI>
        <LegalLI>Retirar el consentimiento prestado en cualquier momento, sin que ello afecte a la licitud del tratamiento anterior.</LegalLI>
      </ul>
      <LegalP>
        Para ejercer estos derechos, el usuario puede dirigirse a CabezaPerro mediante correo electrónico a cabezaperro015@gmail.com, indicando el derecho que desea ejercer y acompañando copia de un documento identificativo.
      </LegalP>
      <LegalP>
        Asimismo, el usuario tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que sus derechos han sido vulnerados.
      </LegalP>
      <LegalH2>7. Medidas de seguridad</LegalH2>
      <LegalP>
        CabezaPerro ha adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad de los datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado, de conformidad con lo establecido en el RGPD.
      </LegalP>
    </LegalLayout>
  );
}

export function PoliticaCookies() {
  return (
    <LegalLayout title="Política de cookies" updated="10 de septiembre de 2026">
      <LegalH2>1. ¿Qué son las cookies?</LegalH2>
      <LegalP>
        Las cookies son pequeños archivos de texto que un sitio web descarga y almacena en el navegador del usuario para recordar información sobre su visita, como preferencias de idioma, datos de navegación o información para análisis estadístico.
      </LegalP>
      <LegalH2>2. Cookies utilizadas en este sitio</LegalH2>
      <LegalH3>Cookies técnicas (exentas de consentimiento)</LegalH3>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Carrito de compra:</strong> almacena los productos seleccionados por el usuario durante la navegación. Es estrictamente necesaria para el funcionamiento de la tienda.</LegalLI>
      </ul>
      <LegalH3>Cookies analíticas (requieren consentimiento)</LegalH3>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Google Analytics / Google Tag Manager:</strong> recopila información anónima sobre cómo los usuarios interactúan con el sitio web (páginas visitadas, tiempo de permanencia, origen de la visita) con fines estadísticos y de mejora.</LegalLI>
      </ul>
      <LegalH3>Cookies de terceros</LegalH3>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Stripe:</strong> utilizada durante el proceso de pago para garantizar la seguridad de la transacción.</LegalLI>
      </ul>
      <LegalH2>3. Gestión del consentimiento</LegalH2>
      <LegalP>
        Las cookies analíticas solo se instalan tras la obtención del consentimiento del usuario, de conformidad con lo establecido en la Ley 34/2002 (LSSI-CE) y el Reglamento (UE) 2016/679 (RGPD). El usuario puede retirar su consentimiento en cualquier momento borrando las cookies almacenadas en su navegador.
      </LegalP>
      <LegalH2>4. Cómo desactivar o eliminar las cookies</LegalH2>
      <LegalP>
        El usuario puede configurar su navegador para que no acepte cookies o para que le avise cuando se envían. Cada navegador tiene un procedimiento distinto:
      </LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.</LegalLI>
        <LegalLI><strong>Mozilla Firefox:</strong> Preferencias → Privacidad y seguridad → Cookies.</LegalLI>
        <LegalLI><strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web.</LegalLI>
        <LegalLI><strong>Microsoft Edge:</strong> Configuración → Cookies y permisos de sitios.</LegalLI>
      </ul>
      <LegalP>
        Si desactiva las cookies técnicas, es posible que algunas funcionalidades del sitio web no estén disponibles, como el carrito de compra.
      </LegalP>
    </LegalLayout>
  );
}

export function CondicionesCompra() {
  return (
    <LegalLayout title="Condiciones de compra" updated="10 de septiembre de 2026">
      <LegalH2>1. Ámbito de aplicación</LegalH2>
      <LegalP>
        Las presentes condiciones de compra regulan la relación entre CabezaPerro y los usuarios que adquieran productos a través del sitio web. La realización de un pedido implica la aceptación plena de estas condiciones.
      </LegalP>
      <LegalH2>2. Productos y precios</LegalH2>
      <LegalP>
        Los productos ofertados en el sitio web son alimentos y complementos para perros y gatos. Las imágenes y descripciones son orientativas. CabezaPerro se reserva el derecho a modificar los precios y la disponibilidad de los productos en cualquier momento.
      </LegalP>
      <LegalP>
        El precio aplicado es el que aparece en el sitio web en el momento de realizar el pedido. Los precios incluyen el Impuesto sobre el Valor Añadido (IVA) aplicable.
      </LegalP>
      <LegalH2>3. Realización del pedido</LegalH2>
      <LegalP>
        Para realizar un pedido, el usuario deberá seleccionar los productos deseados, añadirlos al carrito, completar el formulario de checkout con sus datos personales y de entrega, y seleccionar el método de pago. Una vez confirmado el pedido, CabezaPerro enviará una confirmación por correo electrónico.
      </LegalP>
      <LegalH2>4. Pago</LegalH2>
      <LegalP>
        El pago se realiza a través de Stripe, pasarela de pago segura que procesa las transacciones con cifrado. CabezaPerro no almacena ni tiene acceso a los datos de la tarjeta del usuario.
      </LegalP>
      <LegalH2>5. Disponibilidad</LegalH2>
      <LegalP>
        Si algún producto solicitado no estuviera disponible después de haberse confirmado el pedido, CabezaPerro se pondrá en contacto con el usuario para informarle y, en su caso, procederá a la devolución del importe abonado.
      </LegalP>
      <LegalH2>6. Propiedad intelectual</LegalH2>
      <LegalP>
        Todos los contenidos del sitio web están protegidos por derechos de propiedad intelectual e industrial. El usuario no podrá reproducir, distribuir ni utilizar los contenidos con fines comerciales sin autorización expresa de CabezaPerro.
      </LegalP>
      <LegalH2>7. Legislación aplicable</LegalH2>
      <LegalP>
        Estas condiciones se rigen por la legislación española. Para cualquier conflicto, las partes se someten a los juzgados y tribunales de Sevilla.
      </LegalP>
    </LegalLayout>
  );
}

export function DevolucionesDesistimiento() {
  const [showForm, setShowForm] = useState(false);

  const downloadForm = () => {
    const formText = `FORMULARO DE DESISTIMIENTO

(Dirigir a: CabezaPerro · cabezaperro015@gmail.com · +34 644 789 324)

Yo, abajo firmante, notifico que desisto del contrato de compra del siguiente bien / servicio:

Datos del contratante:
- Nombre y apellidos: _______________________________________
- Dirección: _______________________________________________
- Teléfono: ________________________________________________
- Email: ___________________________________________________

Datos del pedido:
- Número de pedido: ________________________________________
- Fecha del pedido: _________________________________________
- Producto(s): ______________________________________________

Declaro:
- Que desisto del contrato de compra conforme al artículo 28 del Real Decreto Legislativo 1/2007.
- Que solicito la devolución del importe abonado.

Lugar y fecha: _____________________________________________

Firma: ____________________________________________________


Instrucciones:
1. Rellena este formulario y envíalo a cabezaperro015@gmail.com
2. El desistimiento debe ejercerse en un plazo máximo de 14 días naturales desde la recepción del producto.
3. CabezaPerro reembolsará el importe en un máximo de 14 días naturales desde la recepción del desistimiento.
4. Los gastos de devolución corren por cuenta del consumidor, salvo defecto del producto.
5. El producto debe devolverse en perfectas condiciones, sin haber sido abierto ni utilizado.
`;

    const blob = new Blob([formText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formulario-desistimiento-cabezaperro.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <LegalLayout title="Devoluciones y desistimiento" updated="10 de septiembre de 2026">
      <LegalH2>1. Derecho de desistimiento</LegalH2>
      <LegalP>
        De conformidad con los artículos 102 y siguientes del Real Decreto Legislativo 1/2007, de 16 de noviembre, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios, el consumidor y usuario tiene derecho a desistir del contrato de compra en un plazo de 14 días naturales desde la recepción del producto, sin necesidad de justificación.
      </LegalP>
      <LegalP>
        El plazo de desistimiento será de 14 días naturales desde la fecha en que el usuario o un tercero por él indicado adquiere la posesión material del producto.
      </LegalP>
      <LegalH2>2. Ejercicio del desistimiento</LegalH2>
      <LegalP>
        Para ejercer el derecho de desistimiento, el usuario deberá notificar su decisión a CabezaPerro a través de una declaración inequívoca (por ejemplo, una carta enviada por correo electrónico a cabezaperro015@gmail.com). El usuario puede utilizar el formulario de desistimiento que se incluye a continuación, aunque su uso no es obligatorio.
      </LegalP>
      <LegalH2>3. Obligaciones del consumidor</LegalH2>
      <ul className="mb-4 space-y-1">
        <LegalLI>El usuario solo será responsable de la disminución del valor de los bienes que resulte de una manipulación distinta a la necesaria para establecer la naturaleza, características y funcionamiento de los mismos.</LegalLI>
        <LegalLI>Los productos deben devolverse en su embalaje original y en perfectas condiciones, sin haber sido abiertos ni consumidos, dada la naturaleza de los productos (alimentación para animales).</LegalLI>
        <LegalLI>Los gastos de devolución corren por cuenta del consumidor.</LegalLI>
      </ul>
      <LegalH2>4. Obligaciones de CabezaPerro</LegalH2>
      <ul className="mb-4 space-y-1">
        <LegalLI>CabezaPerro reembolsará al usuario todas las cantidades abonadas, incluidos los gastos de entrega, en un plazo máximo de 14 días naturales desde la recepción del desistimiento.</LegalLI>
        <LegalLI>El reembolso se efectuará mediante el mismo medio de pago utilizado en la transacción original, salvo que el usuario haya dispuesto expresamente lo contrario.</LegalLI>
      </ul>
      <LegalH2>5. Excepciones al derecho de desistimiento</LegalH2>
      <LegalP>De acuerdo con el artículo 103 del citado texto refundido, no procede el derecho de desistimiento para:</LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI>El suministro de bienes precintados que no sean aptos para ser devueltos por motivos de protección de la salud o de higiene y que hayan sido desprecintados tras la entrega.</LegalLI>
        <LegalLI>El suministro de bienes que, por su naturaleza, vayan inseparablemente unidos a otros bienes que no puedan separarse sin deterioro.</LegalLI>
      </ul>
      <LegalP>
        Dado que CabezaPerro vende productos de alimentación para animales, los productos abiertos o consumidos no podrán ser objeto de desistimiento por motivos de higiene y seguridad alimentaria.
      </LegalP>
      <LegalH2>6. Productos defectuosos</LegalH2>
      <LegalP>
        Si el producto presenta un defecto de fabricación o no se corresponde con lo solicitado, el usuario deberá contactar con CabezaPerro en un plazo de 48 horas desde la recepción. CabezaPerro procederá a la sustitución o devolución del importe, asumiendo en este caso los gastos de envío de la devolución.
      </LegalP>

      <div className="mt-8 rounded-2xl border border-cream-300 bg-cream-50 p-6">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-accent-600" />
          <h3 className="font-serif text-xl text-primary-800">Formulario de desistimiento</h3>
        </div>
        <LegalP>
          Puedes visualizar el formulario de desistimiento o descargarlo para rellenarlo y enviarlo a CabezaPerro.
        </LegalP>
        <div className="mt-3 flex flex-wrap gap-3">
          <button onClick={() => setShowForm(!showForm)} className="button-dark">
            <FileText size={17} /> {showForm ? 'Ocultar formulario' : 'Visualizar formulario'}
          </button>
          <button onClick={downloadForm} className="button-small">
            <Download size={16} /> Descargar formulario
          </button>
        </div>
        {showForm && (
          <div className="mt-6 rounded-xl border border-cream-300 bg-white p-6">
            <h4 className="font-serif text-lg text-primary-800">Formulario de desistimiento</h4>
            <p className="mt-2 text-xs text-secondary-500">(Dirigir a: CabezaPerro · cabezaperro015@gmail.com · +34 644 789 324)</p>
            <div className="mt-4 space-y-3 text-sm text-secondary-700">
              <p>Yo, abajo firmante, notifico que desisto del contrato de compra del siguiente bien / servicio:</p>
              <p><strong>Datos del contratante:</strong></p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Nombre y apellidos: _______________________________________</li>
                <li>Dirección: _______________________________________________</li>
                <li>Teléfono: ________________________________________________</li>
                <li>Email: ___________________________________________________</li>
              </ul>
              <p><strong>Datos del pedido:</strong></p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Número de pedido: ________________________________________</li>
                <li>Fecha del pedido: _________________________________________</li>
                <li>Producto(s): ______________________________________________</li>
              </ul>
              <p><strong>Declaro:</strong></p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Que desisto del contrato de compra conforme al artículo 28 del Real Decreto Legislativo 1/2007.</li>
                <li>Que solicito la devolución del importe abonado.</li>
              </ul>
              <p>Lugar y fecha: _____________________________________________</p>
              <p>Firma: ____________________________________________________</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => window.print()} className="button-small">
                <Printer size={16} /> Imprimir
              </button>
            </div>
          </div>
        )}
      </div>
    </LegalLayout>
  );
}

export function ReservasCancelaciones() {
  return (
    <LegalLayout title="Reservas y cancelaciones" updated="10 de septiembre de 2026">
      <LegalH2>1. Reserva del servicio</LegalH2>
      <LegalP>
        El usuario puede reservar el servicio de paseos y cuidados para perros a través del formulario disponible en el sitio web. La reserva se realiza seleccionando fecha, hora y duración del paseo, así como proporcionando los datos del perro y del dueño.
      </LegalP>
      <LegalP>
        La solicitud de reserva no implica confirmación inmediata. CabezaPerro se pondrá en contacto con el usuario para confirmar la disponibilidad y los detalles del servicio.
      </LegalP>
      <LegalH2>2. Confirmación</LegalH2>
      <LegalP>
        La reserva se considera confirmada cuando CabezaPerro contacta con el usuario y acepta la fecha y hora solicitadas. Hasta ese momento, la solicitud tiene carácter de consulta.
      </LegalP>
      <LegalH2>3. Cancelación por parte del usuario</LegalH2>
      <ul className="mb-4 space-y-1">
        <LegalLI>Si la cancelación se realiza con más de 24 horas de antelación respecto a la fecha y hora del paseo, no se aplicará ningún cargo.</LegalLI>
        <LegalLI>Si la cancelación se realiza con menos de 24 horas de antelación, se abonará el 50% del precio del servicio.</LegalLI>
        <LegalLI>Si el usuario no se presenta en el lugar acordado sin haber cancelado previamente, se abonará el 100% del precio del servicio.</LegalLI>
      </ul>
      <LegalP>
        Para cancelar una reserva, el usuario deberá notificarlo a CabezaPerro por correo electrónico (cabezaperro015@gmail.com) o por WhatsApp (+34 644 789 324), indicando el número de reserva.
      </LegalP>
      <LegalH2>4. Cancelación por parte de CabezaPerro</LegalH2>
      <LegalP>
        CabezaPerro se reserva el derecho a cancelar una reserva por causas de fuerza mayor, condiciones meteorológicas adversas o incapacidad para prestar el servicio. En estos casos, se propondrá una fecha alternativa o se procederá a la devolución íntegra del importe abonado, si lo hubiere.
      </LegalP>
      <LegalH2>5. Tarifas</LegalH2>
      <ul className="mb-4 space-y-1">
        <LegalLI>Paseo de 30 minutos: 6 €</LegalLI>
        <LegalLI>Paseo de 60 minutos: 11 €</LegalLI>
        <LegalLI>Segundo perro: +5 €</LegalLI>
      </ul>
      <LegalP>
        Las tarifas pueden estar sujetas a modificaciones. El precio aplicable es el que aparece en el sitio web en el momento de realizar la reserva.
      </LegalP>
    </LegalLayout>
  );
}

export function EnviosEntregas() {
  return (
    <LegalLayout title="Envíos y entregas" updated="10 de septiembre de 2026">
      <LegalH2>1. Zona de entrega</LegalH2>
      <LegalP>
        CabezaPerro realiza entregas a domicilio en Sevilla Capital y en la provincia de Sevilla, dentro de un radio máximo de 18 km desde el punto de origen. No se realizan envíos a domicilio fuera de esta zona ni a otras provincias.
      </LegalP>
      <LegalH2>2. Plazos de entrega</LegalH2>
      <LegalP>
        Las entregas se realizan en un plazo de 24 a 48 horas desde la confirmación del pedido, en función de la zona y la disponibilidad. CabezaPerro se pondrá en contacto con el usuario para acordar el día y la franja horaria de entrega.
      </LegalP>
      <LegalH2>3. Tarifas de envío</LegalH2>
      <LegalH3>Sevilla Capital</LegalH3>
      <ul className="mb-4 space-y-1">
        <LegalLI>Pedidos superiores a 25 €: envío gratis.</LegalLI>
        <LegalLI>Pedidos de 25 € o menos: 2 €.</LegalLI>
      </ul>
      <LegalH3>Sevilla Provincia (fuera de la capital)</LegalH3>
      <ul className="mb-4 space-y-1">
        <LegalLI>Hasta 6 km: gratis (pedido &gt; 25 €) o 2 € (pedido ≤ 25 €).</LegalLI>
        <LegalLI>De 6 a 9 km: 2,90 € (pedido &gt; 25 €) o 4,90 € (pedido ≤ 25 €).</LegalLI>
        <LegalLI>De 9 a 18 km: 4,90 € (pedido &gt; 25 €) o 6,90 € (pedido ≤ 25 €).</LegalLI>
        <LegalLI>Más de 18 km: no se realiza envío a domicilio.</LegalLI>
      </ul>
      <LegalH2>4. Recepción del pedido</LegalH2>
      <LegalP>
        En el momento de la entrega, el usuario deberá revisar el estado de los productos. Si detecta cualquier incidencia o defecto, deberá comunicarlo a CabezaPerro en un plazo de 48 horas mediante correo electrónico a cabezaperro015@gmail.com.
      </LegalP>
      <LegalH2>5. Pedidos no entregados</LegalH2>
      <LegalP>
        Si CabezaPerro no pudiera realizar la entrega por ausencia del usuario en la dirección indicada, se pondrá en contacto con él para acordar una nueva fecha de entrega. Si transcurridos 7 días no fuera posible la entrega, el pedido será cancelado y se procederá a la devolución del importe abonado.
      </LegalP>
    </LegalLayout>
  );
}

export function AtencionReclamaciones() {
  return (
    <LegalLayout title="Atención al cliente y reclamaciones" updated="10 de septiembre de 2026">
      <LegalH2>1. Atención al cliente</LegalH2>
      <LegalP>
        CabezaPerro pone a disposición de los usuarios los siguientes canales de atención al cliente:
      </LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Email:</strong> cabezaperro015@gmail.com</LegalLI>
        <LegalLI><strong>WhatsApp:</strong> +34 644 789 324</LegalLI>
        <LegalLI><strong>Instagram:</strong> @cabeza.perro</LegalLI>
        <LegalLI><strong>TikTok:</strong> @cabeza_perro</LegalLI>
        <LegalLI><strong>Formulario de contacto:</strong> disponible en la página de contacto del sitio web.</LegalLI>
      </ul>
      <LegalH2>2. Horario de atención</LegalH2>
      <LegalP>
        El horario de atención al cliente es de lunes a sábado, en horario de 9:00 a 21:00. Las consultas recibidas fuera de este horario serán respondidas al día siguiente.
      </LegalP>
      <LegalH2>3. Reclamaciones</LegalH2>
      <LegalP>
        Si el usuario no está satisfecho con un producto o servicio, puede presentar una reclamación mediante:
      </LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI>El formulario de contacto disponible en el sitio web.</LegalLI>
        <LegalLI>Correo electrónico dirigido a cabezaperro015@gmail.com.</LegalLI>
        <LegalLI>WhatsApp al número +34 644 789 324.</LegalLI>
      </ul>
      <LegalP>
        CabezaPerro se compromete a responder a la reclamación en un plazo máximo de 15 días hábiles desde su recepción.
      </LegalP>
      <LegalH2>4. Hojas de reclamaciones</LegalH2>
      <LegalP>
        De conformidad con la normativa autonómica aplicable, CabezaPerro dispone de hojas de reclamaciones oficiales a disposición del consumidor. El usuario puede solicitarlas en cualquier momento.
      </LegalP>
      <LegalH2>5. Arbitraje de consumo</LegalH2>
      <LegalP>
        CabezaPerro se adhiere al sistema arbitral de consumo para la resolución de conflictos que pudieran plantear los consumidores, en los términos establecidos en la normativa aplicable. El arbitraje se realizará a través de la Junta Arbitral de Consumo correspondiente.
      </LegalP>
      <LegalH2>6. Vías alternativas de resolución</LegalH2>
      <LegalP>
        Antes de acudir a la vía judicial, el usuario puede dirigirse a los siguientes organismos:
      </LegalP>
      <ul className="mb-4 space-y-1">
        <LegalLI><strong>Agencia Española de Protección de Datos (AEPD):</strong> para reclamaciones relacionadas con la protección de datos personales.</LegalLI>
        <LegalLI><strong>Junta Arbitral de Consumo:</strong> para la resolución de conflictos en materia de consumo.</LegalLI>
        <LegalLI><strong>Organismo competente en materia de consumo de la Junta de Andalucía:</strong> para reclamaciones relacionadas con productos y servicios.</LegalLI>
      </ul>
    </LegalLayout>
  );
}

export { LEGAL_LINKS };
