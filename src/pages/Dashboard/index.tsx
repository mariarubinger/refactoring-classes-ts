import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { useEffect, useState } from 'react';

interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

//Utility Types: Omit
type NewFoodIem = Omit<FoodItem, "id">; //constrói um tipo selecionando todas as propriedades de FoodItem, exceto a key id.

export default function Dashboard() {
  const [foods, setFoods] = useState<FoodItem[]>([]); //foods é um array de FoodItem e o setFoods é uma função que recebe um array de FoodItem
  const [editingFood, setEditingFood] = useState<FoodItem | any>({}); //quando o componente é montado o editingFood provavelmente não terá nada dentro dele então quando não tiver nada dentro dele, ele não pode ser do tipo FoodItem pq tem propriedades que são obrigatórias
  const [editingModalOpen, setEditingModalOpen] = useState(false);
  const [modalOpen, setmodalOpen] = useState(false);


//O useEffect recebe 2 parâmetros, o primeiro dele é qual função eu quero executar e o segundo é quando eu quero executar essa primeira função
  useEffect(() => {
    async function loadFoods(){
      const response = await api.get('/foods');
      setFoods(response.data)
    }
      loadFoods()
  }, [])

 /*  
  async componentDidMount() {
    const response = await api.get('/foods');

    this.setState({ foods: response.data });
  }
 */

  const handleAddFood = async (food: NewFoodIem) => {
    //se não tiver nada dentro do editingFood, não faz sentido ele verificar editingFood.id, dentro do editingFood tem que ter as props que serão alteradas, se for vazio não tem porque continuar
 /*    if(!editingFood && !editingFood.id){
      return;
    } */

    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: NewFoodIem) => {
 /*    if(!editingFood && !editingFood.id){
      return;
    }
     */
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  const handleEditFood = (food : FoodItem) => {
      setEditingFood(food);
      setEditingModalOpen(true)
  }

  const handleDeleteFood = async (id : number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);
    setFoods(foodsFiltered);
  }

  const toggleModal = () => {
    setmodalOpen(!modalOpen);
  }

  const toggleEditModal = () => {
    setEditingModalOpen(!editingModalOpen);
  }

    return (
      <>
        <Header openModal={toggleModal} />
        <ModalAddFood
          isOpen={modalOpen}
          setIsOpen={toggleModal}
          handleAddFood={handleAddFood}
        />
        <ModalEditFood
          isOpen={editingModalOpen}
          setIsOpen={toggleEditModal}
          editingFood={editingFood}
          handleUpdateFood={handleUpdateFood}
        />

        <FoodsContainer data-testid="foods-list">
          {foods &&
            foods.map(food => (
              <Food
                key={food.id}
                food={food}
                handleDelete={handleDeleteFood}
                handleEditFood={handleEditFood}
              />
            ))}
        </FoodsContainer>
      </>
    );
  }
