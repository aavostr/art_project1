document.addEventListener('DOMContentLoaded', async function () {
  const tableBody = document.querySelector('#wishes-table tbody');
  
  try {
    const response = await fetch('http://localhost:3000/wishes');
    const wishes = await response.json();
    
    if (wishes.length === 0) {
      const noWishesRow = document.createElement('tr');
      noWishesRow.innerHTML = '<td colspan="4">No wishes found</td>';
      tableBody.appendChild(noWishesRow);
    } else {
      wishes.forEach(wish => {
        const row = document.createElement('tr');
        
        // Присваиваем класс "completed" для выполненных задач
        if (wish.completed) {
          row.classList.add('completed');
        }
        
        row.innerHTML = `
          <td>${wish.title}</td>
          <td>${wish.description}</td>
          <td>${wish.completed ? 'Yes' : 'No'}</td>
          <td>${new Date(wish.created_at).toLocaleString()}</td>
          <td>
            <button class="complete-btn" data-id="${wish.id}" ${wish.completed ? 'disabled' : ''}>
              Mark as Completed
            </button>
          </td>
        `;
        
        // Добавляем обработчик для кнопки "Mark as Completed"
        row.querySelector('.complete-btn').addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          
          try {
            const res = await fetch(`http://localhost:3000/wishes/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ completed: true })
            });
            const updatedWish = await res.json();
            // Обновить строку в таблице
            e.target.closest('tr').querySelector('td:nth-child(3)').textContent = 'Yes';
            e.target.setAttribute('disabled', 'true'); // Делаем кнопку недоступной
            // Добавляем класс для выполненной задачи
            e.target.closest('tr').classList.add('completed');
          } catch (error) {
            console.error('Error updating wish:', error);
          }
        });
        
        tableBody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error fetching wishes:', error);
  }
});