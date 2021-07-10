import format from 'date-fns/format';

var span = document.querySelector('#time-now');

const update = () => {
    span.textContent = format(new Date(), 'h:mm:ssa');
    setTimeout(update, 1000);
};
export default update
