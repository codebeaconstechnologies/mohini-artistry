export default function About() {
  return (
    <div className="bg-purple py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Artist Story</span>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Our Story</h1>
        <div className="mt-3 h-px w-16 bg-gold" />

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#F5EAF2] sm:text-base">
          <p>
            Mohini Artistry began with a simple idea: festivals feel warmer when the decorations around us are made
            by hand. What started as a small table of <span className="font-semibold text-magenta">instant rangoli sets</span> at
            a neighbourhood exhibition has grown into a home-based studio creating rangoli sets, resin art and fabric
            canvas paintings for customers across India.
          </p>
          <p>
            Our instant rangoli sets are designed for people who want that festive glow without the mess of loose
            powder, so a beautiful design is only a placement away. In our resin studio, colour and light are
            poured, layered and cured by hand into coasters, trays and wall pieces with a glass-like finish. And on
            canvas, our fabric artists paint traditional motifs — peacocks, mandalas, warli figures — using
            techniques passed down through generations, reimagined in colours that suit a modern home.
          </p>
          <p>
            We're a small, India-based team, and we still pack every order ourselves — cushioning each piece
            carefully so it reaches you exactly as it left our workshop. When you shop with us, you're supporting
            independent craft, not a factory line.
          </p>
          <p>
            Thank you for making space in your home for something handmade. We hope it brings a little more colour
            to your celebrations.
          </p>
        </div>
      </div>
    </div>
  );
}
