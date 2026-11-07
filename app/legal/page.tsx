import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import OfficialDisclaimer from "@/components/OfficialDisclaimer";
import Contact from "@/components/Contact";

export const metadata = { title: "Legal information" };

const toc: [string, string][] = [
  ["copy", "Copyright"],
  ["sub", "Submitted material"],
  ["warr", "No warranty"],
  ["ref", "References"],
  ["off", "No official status"],
  ["liab", "No liability"],
  ["other", "Other entities"],
  ["priv", "Privacy"],
  ["accuracy", "Data accuracy and corrections"],
  ["licenses", "Third-party software and licences"],
  ["takedown", "Intellectual property and takedown requests"],
  ["contact", "Contact and legal enquiries"],
];

export default function Legal() {
  return (
    <>
      <PageHeader
        title="Legal information"
        crumbs={[{ label: "Legal information" }]}
      >
        <p>
          These terms describe the conditions for using Loco Portal.
          This information is provided for general reference and is
          not legal advice.
        </p>
      </PageHeader>

      <nav
        aria-label="On this page"
        className="border border-gray-200 bg-gray-50 p-4 mb-6 max-w-3xl"
      >
        <p className="font-semibold text-navy mb-2">Contents</p>

        <ol className="list-decimal pl-5 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
          {toc.map(([id, t]) => (
            <li key={id}>
              <a href={`#${id}`}>{t}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="prose-doc [&_section]:scroll-mt-4">
        <section id="copy">
          <h2>1. Copyright</h2>

          <p>
            Content displayed on this site may include original material
            and information from third-party sources. Loco Portal does
            not claim ownership of third-party photographs, text, logos,
            datasets, diagrams or trademarks and respects the licences
            and permissions attached to them.
          </p>

          <p>
            Names such as Indian Railways, locomotive class names and
            production-unit names belong to their respective owners and
            are used here only for identification and reference.
          </p>
        </section>

        <section id="sub">
          <h2>2. Submitted material</h2>

          <p>
            Information, corrections or images submitted to the project
            do not automatically transfer ownership or copyright to
            Loco Portal. Material may be published only where the
            necessary rights or permissions are available.
          </p>
        </section>

        <section id="warr">
          <h2>3. No warranty</h2>

          <p>
            The information on this site is provided as is for general
            informational and reference purposes. It is not guaranteed
            to be complete, current, accurate or free of errors and
            may change or be removed without notice.
          </p>

          <p>
            Do not use this website for operational, maintenance or
            safety-critical decisions.
          </p>
        </section>

        <section id="ref">
          <h2>4. References</h2>

          <p>
            The initial locomotive data is compiled from supplied
            records and has not been independently verified. See{" "}
            <Link href="/sources">Data status</Link> and{" "}
            <Link href="/acknowledgements">Acknowledgements</Link>.
          </p>

          <p>
            No organisation has reviewed or verified the content
            of this site.
          </p>
        </section>

        <section id="off">
          <h2>5. No official status</h2>

          <OfficialDisclaimer />

          <p>
            This site does not use Indian Railways logos or design
            elements and is not meant to look official. Nothing here
            is an official notice, timetable, order or record.
            The site is also not affiliated with the Indian Railways
            Fan Club Association (IRFCA).
          </p>
        </section>

        <section id="liab">
          <h2>6. No liability</h2>

          <p>
            To the fullest extent permitted by applicable law, the
            project owner is not liable for loss or damage arising
            from the use of, or inability to use, this site or from
            reliance on its content.
          </p>

          <p>
            Nothing in these terms excludes or limits any liability
            that cannot be excluded or limited by law.
          </p>
        </section>

        <section id="other">
          <h2>7. Other entities</h2>

          <p>
            Links to other websites, including the official Indian
            Railways website, are provided for convenience and
            reference. They do not mean that Loco Portal endorses
            those sites or that they endorse Loco Portal.
          </p>

          <p>
            Loco Portal is not responsible for the content or
            privacy practices of external websites.
          </p>
        </section>

        <section id="priv">
          <h2>8. Privacy</h2>

          <p>
            Visitors do not need an account to browse the public
            website. The site's code includes no analytics,
            advertising or tracking scripts.
          </p>

          <p>
            Administrator accounts and the service providers that
            operate the site may process personal data. Read the
            full <Link href="/privacy">Privacy statement</Link>.
          </p>
        </section>

        <section id="accuracy">
          <h2>9. Data accuracy and corrections</h2>

          <p>
            Each locomotive record shows a verification status:
            verified, source listed, unverified or disputed.
            Source listed means the record comes from supplied
            records and has not been independently checked.
          </p>

          <p>
            Locomotives are reallocated and renumbered, so records
            can become outdated. If you find an error, report it
            using the contact route below, stating which locomotive
            and what a reliable source shows.
          </p>

          <p>
            Reported errors are reviewed by the maintainer.
            No response time is guaranteed.
          </p>

          <Contact topic="corrections" />
        </section>

        <section id="licenses">
          <h2>10. Third-party software and licences</h2>

          <p>
            The site is built with open-source packages including
            Next.js, React, Tailwind CSS and TypeScript under
            their respective licences.
          </p>

          <p>
            Their licences apply to those packages only.
            Using them does not make Loco Portal's own code,
            text or data open source.
          </p>

          <p>
            See the{" "}
            <Link href="/acknowledgements#software">
              Acknowledgements
            </Link>{" "}
            page for the software list.
          </p>
        </section>

        <section id="takedown">
          <h2>11. Intellectual property and takedown requests</h2>

          <p>
            If you are a rights holder and believe content on this
            site infringes your rights, send a notice containing:
          </p>

          <ul>
            <li>Your name and contact details.</li>
            <li>A description of the work.</li>
            <li>The exact page address where the material appears.</li>
            <li>A statement explaining why you believe the use is unauthorised.</li>
            <li>A statement that the information is accurate.</li>
          </ul>

          <p>
            Notices are reviewed by the maintainer. Content may
            be removed or hidden while a notice is assessed.
            Sending a notice does not mean a claim has been
            accepted or resolved.
          </p>

          <Contact topic="takedown notices" />
        </section>

        <section id="contact">
          <h2>12. Contact and legal enquiries</h2>

          <Contact topic="legal enquiries, corrections and privacy requests" />
        </section>
      </div>
    </>
  );
}
