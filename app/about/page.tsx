import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import OfficialDisclaimer from "@/components/OfficialDisclaimer";
import Contact from "@/components/Contact";

export const metadata = { title: "About Loco Portal" };

export default function About() {
  return (
    <>
      <PageHeader
        title="About Loco Portal"
        crumbs={[{ label: "About" }]}
      />

      <div className="prose-doc">
        <OfficialDisclaimer />

        <h2 id="about">About Loco Portal</h2>
        <p>
          Loco Portal is a structured, searchable reference to Indian Railways
          locomotives. It allows users to look up a locomotive by its number
          and explore its class, shed, zone and production unit.
          It is maintained as an independent project.
        </p>

        <h2 id="scope">Scope of information</h2>
        <p>The database includes the following information:</p>

        <ul>
          <li>
            <strong>Locomotives:</strong> Five-digit number, class, home shed,
            zone, production unit or builder where known, Kavach make where
            listed, service status, verification status and last verification
            date.
          </li>
          <li>
            <strong>Classes:</strong> Class code, traction, gauge, service type,
            overview, history and technical specifications where available.
          </li>
          <li>
            <strong>Sheds, zones and manufacturers:</strong> Codes, names and
            locations where available.
          </li>
        </ul>

        <p>
          Current totals are shown on the <Link href="/">home page</Link>.
          The database does not claim to list every locomotive.
        </p>

        <h2 id="audience">Intended audience</h2>
        <p>
          Railway enthusiasts, students, researchers and technical readers
          who want a quick, cross-linked locomotive reference.
          The site is not intended for railway staff to use in their work,
          and its use does not imply any official endorsement.
        </p>

        <h2 id="data-sources">Data sources and verification</h2>
        <p>
          Locomotive records are compiled from supplied records and
          normalised before publication. See{" "}
          <Link href="/sources">Data status</Link>.
        </p>

        <ul>
          <li>
            <strong>Verified:</strong> Checked against a source recorded
            by the maintainer.
          </li>
          <li>
            <strong>Source listed:</strong> Compiled from supplied records
            and not independently checked.
          </li>
          <li>
            <strong>Unverified:</strong> No source check has been made.
          </li>
          <li>
            <strong>Disputed:</strong> Conflicting information exists.
          </li>
        </ul>

        <h2 id="limitations">Limitations</h2>
        <p>
          Records may be incomplete, out of date or incorrect.
          Locomotives may be reallocated, renumbered, transferred or
          withdrawn without notice.
        </p>

        <p>
          Loco Portal is an informational reference.
          <strong>
            {" "}Do not rely on it for operational instructions,
            maintenance, safety-critical or legal decisions.
          </strong>
          Always consult official Indian Railways sources for those.
        </p>

        <h2 id="corrections">Corrections and contact</h2>
        <Contact topic="corrections" />

        <p>
          See <Link href="/legal#accuracy">Data accuracy and corrections</Link>,{" "}
          <Link href="/acknowledgements">Acknowledgements</Link>,{" "}
          <Link href="/legal">Legal information</Link> and{" "}
          <Link href="/privacy">Privacy</Link>.
        </p>
      </div>
    </>
  );
}
