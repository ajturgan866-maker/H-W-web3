const BASE_URL = 'https://inai-col1.fishrungames.com';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applicationForm');
    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('resultContainer');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        resultContainer.classList.add('d-none');
        resultContainer.innerHTML = '';
        
        const studentId = document.getElementById('studentId').value;
        const buildingId = document.getElementById('buildingId').value;
        const roomId = document.getElementById('roomId').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Проверка...';

        try {
            const [studentRes, buildingRes, roomRes] = await Promise.all([
                fetch(`${BASE_URL}/students/${studentId}`),
                fetch(`${BASE_URL}/buildings/${buildingId}`),
                fetch(`${BASE_URL}/rooms/${roomId}`)
            ]);

            if (!studentRes.ok) throw new Error('Студент с таким ID не найден');
            if (!buildingRes.ok) throw new Error('Корпус с таким номером не найден');
            if (!roomRes.ok) throw new Error('Комната с таким номером не найдена');

            const student = await studentRes.json();
            const building = await buildingRes.json();
            const room = await roomRes.json();

            const isNonResident = student.resident === false;
            const isForStudents = building.forStudents === true;
            const isRoomAvailable = room.available === true;

            const isApproved = isNonResident && isForStudents && isRoomAvailable;

            renderResult(isApproved, {
                student: { ok: isNonResident, text: 'Студент иногородний' },
                building: { ok: isForStudents, text: 'Корпус для студентов' },
                room: { ok: isRoomAvailable, text: 'Комната свободна' }
            });

        } catch (error) {
            renderError(error.message || 'Произошла ошибка при проверке данных. Пожалуйста, попробуйте позже.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Проверить заявку';
        }
    });

    function renderResult(isApproved, details) {
        resultContainer.classList.remove('d-none');
        
        const alertClass = isApproved ? 'alert-success' : 'alert-danger';
        const title = isApproved ? 'Заявка одобрена' : 'Отказ в заселении';
        
        let html = `
            <div class="alert ${alertClass}" role="alert">
                <h5 class="alert-heading">${title}</h5>
                <hr>
                <ul class="mb-0">
        `;

        Object.values(details).forEach(item => {
            html += `<li>${item.text}</li>`;
        });

        html += `</ul></div>`;
        
        resultContainer.innerHTML = html;
    }

    function renderError(message) {
        resultContainer.classList.remove('d-none');
        resultContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Ошибка:</strong> ${message}
            </div>
        `;
    }
});