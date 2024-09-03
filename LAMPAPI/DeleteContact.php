
<?php


    $inData = getRequestInfo();
	
    $name = $inData["name"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE Name = ? AND Phone = ? AND Email = ? AND UserID = ?");
		$stmt->bind_param("sssi", $name, $phone, $email, $userID);
		//$stmt->execute();
		//$result = $stmt->get_result();


        if($stmt->execute())
        {
            if($stmt->affected_rows > 0)
            {

                returnWithInfo("Successful deletion from contacts");

            }else
            {
                returnWithError("No contact to delete with information given. Please check any spelling errors.");
            }
        }
        else
        {
            returnWithError("Error in deleting contact." . $stmt->error);
        }


		$stmt->close();
		$conn->close();
	}

	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $info )
	{
		$retValue = '{"result":"' . $info .'","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
