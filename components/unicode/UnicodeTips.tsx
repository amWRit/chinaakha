export default function UnicodeTips() {
  return (
    <div className="unicode-tips">
      <div className="tips-section">
        <h4>🔤 Basic Rules</h4>
        <ul>
          <li>Type phonetically: <code>namaste</code> → नमस्ते</li>
          <li>Use spaces to accept suggestions</li>
          <li>Capital letters for retroflex sounds</li>
        </ul>
      </div>

      <div className="tips-section">
        <h4>⚡ Special Characters</h4>
        <ul>
          <li><code>{"{}"}</code> = Keep English: <code>yo {"{mobile}"}</code> → यो mobile</li>
          <li><code>/</code> = Separate letters: <code>pratishat/ko</code> → प्रतिशतको</li>
          <li><code>\</code> = Add halant: <code>bas\</code> → बस्</li>
        </ul>
      </div>

      <div className="tips-section">
        <h4>📋 Letter Variations</h4>
        <div className="tips-grid">
          <div><code>ta</code> = त</div>
          <div><code>Ta</code> = ट</div>
          <div><code>tha</code> = थ</div>
          <div><code>Tha</code> = ठ</div>
          <div><code>da</code> = द</div>
          <div><code>Da</code> = ड</div>
          <div><code>dha</code> = ध</div>
          <div><code>Dha</code> = ढ</div>
          <div><code>na</code> = न</div>
          <div><code>Na</code> = ण</div>
          <div><code>sha</code> = श</div>
          <div><code>Sha</code> = ष</div>
        </div>
        <p className="tips-note">💡 Letter case doesn't matter for other letters</p>
      </div>

      <div className="tips-section">
        <h4>✨ Special Combinations</h4>
        <div className="tips-grid">
          <div><code>ri^</code> = रि</div>
          <div><code>rr</code> = र्‍</div>
          <div><code>rri</code> = ऋ</div>
          <div><code>rree</code> = ॠ</div>
          <div><code>yna</code> = ञ</div>
          <div><code>chha</code> = छ</div>
          <div><code>ksha</code> = क्ष</div>
          <div><code>gya</code> = ज्ञ</div>
          <div><code>*</code> = अनुस्वर</div>
          <div><code>**</code> = चन्द्रबिन्दु</div>
          <div><code>om</code> = ॐ</div>
        </div>
      </div>

      <div className="tips-section">
        <h4>🎯 Poetry Tips</h4>
        <ul>
          <li>Use <code>/</code> for separate words in compounds</li>
          <li>Type <code>।</code> or <code>/</code> for Nepali full stop (danda)</li>
          <li>Type <code>॥</code> or <code>//</code> for double danda</li>
          <li>Press Enter to preserve line breaks for stanzas</li>
        </ul>
      </div>
    </div>
  );
}
