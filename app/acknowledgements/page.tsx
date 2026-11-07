import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata = { title: "Acknowledgements" };

const libs: [string, string, string][] = [
  ["Next.js", "MIT", "Web framework"],
  ["React and React DOM", "MIT", "User-interface library"],
  ["Database and session client libraries", "MIT", "Data access and sign-in session handling"],
  ["Tailwind CSS", "MIT", "Styling"],
  ["PostCSS and Autoprefixer", "MIT", "CSS processing"],
  ["TypeScript", "Apache-2.0", "Language and type checker"],
  ["@types/node, @types/react, @types/react-dom", "MIT", "Type definitions"],
];

export default function Ack() {
  return (
    <>
      <PageHeader
        title="Acknowledgements"
        crumbs={[{ label: "Acknowledgements" }]}
      >
        <p>
          Thanks and attribution for the material and software this site
          depends on. Acknowledging a source does not mean that source
          endorses, reviews or is connected with Loco Portal.
        </p>
      </PageHeader>

      <div className="prose-doc">
        <h2 id="data">Data</h2>

        <ul>
          <li>
            <strong>Locomotive records:</strong> Compiled from supplied
            records. Records labelled source listed are not independently
            verified.
          </li>
          <li>
            <strong>Reference publications and external datasets:</strong>{" "}
            References are included where applicable.
          </li>
        </ul>

        <h2 id="media">Photographs, diagrams and other media</h2>
        <p>
          The project uses the system's default fonts. Media used in the
          project is subject to its applicable licences and permissions.
        </p>

        <h2 id="software">Open-source software</h2>
        <p>
          Loco Portal is built with the following open-source packages.
          Licences below were read from the installed packages' own
          metadata; the full licence text ships with each package.
        </p>

        <div className="table-wrap max-w-3xl">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Package</th>
                <th scope="col">Licence</th>
                <th scope="col">Used for</th>
              </tr>
            </thead>

            <tbody>
              {libs.map(([n, l, u]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>{l}</td>
                  <td>{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3">
          Using open-source libraries does not make Loco Portal itself
          open source. See{" "}
          <Link href="/legal#licenses">
            Third-party software and licences
          </Link>.
        </p>

        <h2 id="inspiration">Third-Party Applications</h2>
        <p>
          Loco Portal is an independent project. It is not affiliated
          with, endorsed by or derived from any Third-Party Applications
          or their content.
        </p>
      </div>
    </>
  );
}
