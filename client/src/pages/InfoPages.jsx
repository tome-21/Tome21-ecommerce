import { InfoPage, Section, Bullets, SUPPORT_EMAIL } from "../components/InfoPage";

const EFFECTIVE = "October 26, 2026";

/* ---------------------------------- About --------------------------------- */
export function About() {
  return (
    <InfoPage
      title="About Tome21"
      intro="Traditional and modern Ethiopian fashion. Your style. Your order."
    >
      <Section title="Who we are">
        <p>
          Tome21 Store is an online shopping business specializing in beautiful
          traditional and modern Ethiopian fashion. We aim to bring customers
          stylish, quality, and attractive traditional clothing that celebrates
          Ethiopian culture and identity.
        </p>
        <p>
          We believe every customer deserves a style that matches their taste
          and personality. Besides our collection, we accept orders for products
          you are looking for. Our goal is to make shopping simple, convenient,
          and customer-focused.
        </p>
      </Section>

      <Section title="Our products and services">
        <Bullets
          items={[
            <><strong>Traditional Ethiopian Fashion:</strong> clothing for different occasions and celebrations.</>,
            <><strong>Modern Fashion:</strong> items for customers who enjoy contemporary styles.</>,
            <><strong>Custom Anime Hoodies:</strong> anime-inspired hoodies for fans who want to express their interests through fashion.</>,
            <><strong>Custom Customer Orders:</strong> tell us what you want and we will work to fulfill your request.</>,
            <><strong>Customer-Focused Service:</strong> we prioritize satisfaction, communication, and a convenient shopping experience.</>,
          ]}
        />
      </Section>

      <Section title="Our mission">
        <p>
          To provide customers with beautiful traditional fashion and convenient
          access to the products they want while building trust through reliable
          service.
        </p>
      </Section>

      <Section title="Our vision">
        <p>
          To grow Tome21 Store into a trusted online shopping brand known for
          Ethiopian traditional fashion, customer service, and a wide range of
          products.
        </p>
      </Section>

      <Section title="Our commitment">
        <p>
          Customers come first. We aim to provide a smooth ordering experience,
          communicate clearly about prices and delivery, and help you find
          products that meet your needs.
        </p>
      </Section>
    </InfoPage>
  );
}

/* ---------------------------------- Terms --------------------------------- */
export function Terms() {
  return (
    <InfoPage
      title="Terms and Conditions"
      updated={EFFECTIVE}
      intro="These terms explain the basic rules for ordering from Tome21 Store. Please read them before placing an order."
    >
      <Section title="1. About Tome21 Store">
        <p>
          Tome21 Store is an online fashion and shopping business offering
          traditional Ethiopian fashion, modern fashion, anime hoodies, and
          other products requested by customers.
        </p>
      </Section>

      <Section title="2. Orders and product availability">
        <Bullets
          items={[
            "Provide accurate order details, including item, size, color, design, quantity, and delivery information.",
            "Orders are subject to product availability and, where relevant, supplier confirmation. For items not in stock, we will make reasonable efforts to source the product.",
            "An order is confirmed once we confirm the product, total price, payment arrangements, and any available delivery estimate.",
            "If a product is unavailable or a significant delay arises, we will inform you and discuss the options.",
          ]}
        />
      </Section>

      <Section title="3. Prices and bank or mobile payments">
        <Bullets
          items={[
            "All prices, including any delivery or other charges, are communicated before the order is confirmed.",
            "Payment is made by bank transfer or mobile banking using the instructions we provide directly. Please verify the payment details before transferring money.",
            "Keep your transaction receipt or reference number until the order is completed. An order may not be treated as paid until the payment has been reasonably verified.",
            "An advance payment or deposit may be required for special orders. Before you pay, we will explain the amount and the cancellation and refund conditions.",
            "Do not send payment to an unverified account or rely on changed payment details without confirming them through our official communication channel.",
          ]}
        />
      </Section>

      <Section title="4. Delivery and collection">
        <Bullets
          items={[
            "Estimated delivery or collection arrangements are communicated when the order is placed. Timing may depend on availability, suppliers, delivery services, and your location.",
            "You are responsible for providing accurate contact and delivery information. Any delivery fee is disclosed before the order is finalized.",
            "If a delay occurs, we will make reasonable efforts to update you. Estimates are given in good faith and may change due to circumstances outside our reasonable control.",
          ]}
        />
      </Section>

      <Section title="5. Cancellations and refunds">
        <Bullets
          items={[
            "To cancel an order, contact us as soon as possible. Whether it can be cancelled may depend on whether sourcing, preparation, dispatch, or other commitments have already begun.",
            "For special or custom orders, any deposit, cancellation, and refund conditions are explained before payment. They do not remove any rights you have under applicable law.",
            "If we cannot fulfill a confirmed and paid order, we will contact you to arrange an appropriate refund or another solution you agree to.",
            "Report defective, damaged, or incorrect items promptly after receipt, with details or photographs where practical. We will handle such issues fairly in accordance with applicable law.",
            "Any eligible refund is coordinated with you using a reasonable payment method and timeframe. Payment-provider processing times may affect when funds arrive.",
          ]}
        />
      </Section>

      <Section title="6. Product descriptions and images">
        <p>
          We aim to provide accurate descriptions and images. Colors may look
          slightly different because of lighting or screen settings. Please
          confirm important details, including size, design, and specifications,
          before confirming an order.
        </p>
      </Section>

      <Section title="7. Custom and special orders">
        <p>
          Confirm the requested design, size, color, and other specifications
          before a custom order is finalized. Custom or sourced products may
          require additional preparation time and advance payment. Any special
          conditions about changes, cancellations, or refunds are explained
          before payment and remain subject to applicable law.
        </p>
      </Section>

      <Section title="8. Customer responsibilities">
        <p>
          You agree to provide accurate information, review the order and total
          price before confirmation, follow the agreed payment arrangements, and
          contact us promptly if a problem arises.
        </p>
      </Section>

      <Section title="9. Privacy and personal information">
        <p>
          We use customer information such as names, contact details, payment
          confirmation, and delivery addresses as reasonably necessary to
          process orders, arrange delivery, provide support, and meet legal
          obligations. We take reasonable steps to protect it, and may share it
          with relevant service providers when needed to complete an order or
          when required by law.
        </p>
      </Section>

      <Section title="10. Changes to orders and these terms">
        <p>
          Requests to change an order depend on its status, product
          availability, and supplier commitments. We may update these Terms and
          Conditions when necessary. Applicable law determines which terms apply
          to an existing order.
        </p>
      </Section>

      <Section title="11. Customer support and complaints">
        <p>
          Contact us through the channel you used to place the order, with your
          order details and a clear explanation of the issue. We will make
          reasonable efforts to respond and resolve complaints fairly.
        </p>
      </Section>

      <Section title="12. Applicable law">
        <p>
          These terms are intended to operate in accordance with applicable laws
          of Ethiopia, including any mandatory consumer protection requirements
          that apply to the transaction. Nothing here excludes rights that
          cannot legally be excluded.
        </p>
      </Section>

      <Section title="13. Agreement">
        <p>
          By placing an order, you acknowledge having had an opportunity to read
          these Terms and Conditions. The terms apply subject to your rights
          under applicable law.
        </p>
      </Section>
    </InfoPage>
  );
}

/* --------------------------------- Privacy -------------------------------- */
export function Privacy() {
  return (
    <InfoPage
      title="Privacy Policy"
      updated={EFFECTIVE}
      intro="Your privacy is important to us. This page explains what information we use and why."
    >
      <Section title="Information we collect">
        <Bullets
          items={[
            "Your name and contact details",
            "Delivery address",
            "Payment confirmation, such as a receipt or reference number",
            "Order details you give us (item, size, color, design, quantity)",
          ]}
        />
      </Section>

      <Section title="How we use it">
        <Bullets
          items={[
            "To process and confirm your orders",
            "To arrange delivery or collection",
            "To provide customer support and resolve complaints",
            "To meet our legal obligations",
          ]}
        />
      </Section>

      <Section title="Sharing your information">
        <p>
          We may share information with relevant service providers, such as
          delivery services, only when needed to complete your order, or when
          required by law.
        </p>
      </Section>

      <Section title="Keeping it safe">
        <p>
          We take reasonable steps to protect your personal information. You can
          help by never sharing your PIN or password with anyone, and by using
          only the payment details provided directly by Tome21 Store.
        </p>
      </Section>

      <Section title="Contact us">
        <p>
          For questions about your information, email{" "}
          <a className="font-medium text-[#2f7d1b] hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </InfoPage>
  );
}

/* --------------------------------- Billing -------------------------------- */
export function Billing() {
  return (
    <InfoPage
      title="Billing Policy"
      updated={EFFECTIVE}
      intro="Clear prices, safe payments, and no surprises."
    >
      <Section title="Prices">
        <p>
          We tell you the total price, including any delivery or other charges,
          before your order is confirmed.
        </p>
      </Section>

      <Section title="How to pay">
        <Bullets
          items={[
            "Pay by bank transfer or mobile banking.",
            "Use only the payment details provided directly by Tome21 Store, and verify them before transferring money.",
            "If payment details ever change, confirm them through our official communication channel first.",
          ]}
        />
      </Section>

      <Section title="Confirming your payment">
        <p>
          Keep your receipt or reference number until your order is completed.
          We confirm your payment before processing your order, and an order may
          not be treated as paid until it has been reasonably verified.
        </p>
      </Section>

      <Section title="Deposits for special orders">
        <p>
          Custom or sourced products may need an advance payment. Before you pay,
          we explain the amount required and the cancellation and refund
          conditions.
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          If we cannot fulfill a confirmed and paid order, we will contact you to
          arrange a refund or another solution you agree to. Eligible refunds
          use a reasonable payment method and timeframe, and payment-provider
          processing times may affect when funds arrive. Nothing here removes
          your rights under applicable law.
        </p>
      </Section>
    </InfoPage>
  );
}

/* --------------------------------- Contact -------------------------------- */
export function Contact() {
  return (
    <InfoPage
      title="Contact Us"
      intro="Ask us anything before you order. We're here to help."
    >
      <Section title="Email">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-block rounded-full bg-[#3e9d24] px-6 py-2.5 font-semibold text-white hover:bg-[#2f7d1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e9d24] focus-visible:ring-offset-2"
        >
          {SUPPORT_EMAIL}
        </a>
      </Section>

      <Section title="Already placed an order?">
        <p>
          Contact us through the same channel you used to order, and include
          your order details and a clear explanation of the issue. We will make
          reasonable efforts to respond and resolve it fairly.
        </p>
      </Section>

      <Section title="Reporting a problem with an item">
        <p>
          Tell us promptly after you receive it, and include photographs where
          you can. It helps us find a solution faster.
        </p>
      </Section>
    </InfoPage>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */
const FAQS = [
  ["What do you sell?", "Traditional Ethiopian fashion, modern fashion, custom anime hoodies, and other products requested by customers."],
  ["Can I order something that isn't listed?", "Yes. Tell us what you are looking for and we will work to fulfill your request. Items that aren't in stock are sourced where possible, and we will let you know if something is unavailable."],
  ["How do I pay?", "By bank transfer or mobile banking, using the payment details provided directly by Tome21 Store. Never share your PIN or password."],
  ["When is my order confirmed?", "Once we confirm the product, total price, payment arrangements, and any available delivery estimate. We also verify your payment before processing."],
  ["Do I need to pay a deposit?", "Possibly, for special or custom orders. We explain the amount and the cancellation and refund conditions before you pay."],
  ["How long does delivery take?", "We share an estimate when you place the order. It depends on availability, suppliers, delivery services, and your location, and we will update you if it changes."],
  ["Can I cancel my order?", "Contact us as soon as possible. Whether it can be cancelled depends on whether sourcing, preparation, or dispatch has already begun."],
  ["My item is damaged or wrong. What now?", "Contact us promptly with details and photos if you can. We will handle it fairly and find a solution."],
  ["Will colors match the photos?", "We aim for accuracy, but colors can look slightly different because of lighting or screen settings. Please confirm important details before ordering."],
];

export function FAQ() {
  return (
    <InfoPage title="Frequently Asked Questions" intro="Quick answers to common questions.">
      <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
              {q}
              <span
                aria-hidden="true"
                className="text-xl text-[#3e9d24] transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}

/* ---------------------------------- Safety -------------------------------- */
const TIPS = [
  ["Check your order", "Confirm the product, size, color, and price before paying."],
  ["Pay safely", "Use the payment details provided by Tome21 Store. Never share your PIN or password."],
  ["Keep your receipt", "Save your payment confirmation for your records."],
  ["Order confirmation", "We will confirm your payment before processing your order."],
  ["Ask us anytime", "If you have questions, contact us before placing your order."],
  ["Your privacy matters", "We respect your privacy and protect your personal information."],
  ["Need help?", "If something goes wrong with your order, contact us so we can help find a solution."],
];

export function Safety() {
  return (
    <InfoPage
      title="Customer Safety Tips"
      intro="Your trust matters to us. We want you to enjoy safe and easy shopping."
    >
      <ol className="mt-8 space-y-5">
        {TIPS.map(([title, text], i) => (
          <li key={title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-[#2f7d1b]">
              {i + 1}
            </span>
            <div>
              <h2 className="font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <Section title="Our promise">
        <p>
          We aim to provide honest information, clear communication, and
          friendly service. Every customer deserves respect and care.
        </p>
      </Section>
    </InfoPage>
  );
}