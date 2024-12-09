import './styles/style.css';
import displayController from './components/display_controller';

displayController.domReady(() => (document.body.style.visibility = 'visible'));
