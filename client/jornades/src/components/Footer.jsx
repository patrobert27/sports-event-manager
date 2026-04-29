export default function Footer() {
  return (
    <footer className="bg-white border-t border-primary/10 mt-8">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-muted">
        Jornades Esportives © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
