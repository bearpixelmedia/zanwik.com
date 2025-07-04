from flask import Flask, render_template, request, send_file, redirect, url_for
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'static/generated'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        prompt = request.form.get('prompt')
        template_type = request.form.get('template_type')
        # Placeholder: Save prompt and type, simulate generation
        with open(os.path.join(UPLOAD_FOLDER, 'prompt.txt'), 'w') as f:
            f.write(f"Prompt: {prompt}\nType: {template_type}")
        return redirect(url_for('download'))
    return render_template('index.html')

@app.route('/download')
def download():
    # Placeholder: Download the prompt.txt as a test
    file_path = os.path.join(UPLOAD_FOLDER, 'prompt.txt')
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True) 